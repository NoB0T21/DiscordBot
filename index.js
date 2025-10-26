import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { joinVoiceChannel, EndBehaviorType, getVoiceConnection } from '@discordjs/voice';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prism from 'prism-media';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

// Map to store user audio streams and file paths
const userStreams = new Map();

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function startRecording(userId, username, receiver) {
    const audioStream = receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.Manual }
    });

    const recordingsDir = path.join(__dirname, 'recordings');
    fs.mkdirSync(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `${username}-${userId}-${Date.now()}.pcm`);
    const pcmStream = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
    const writeStream = fs.createWriteStream(filePath);
    audioStream.pipe(pcmStream).pipe(writeStream);

    userStreams.set(userId, { audioStream, filePath, username });
    console.log(`${username} recording started: ${filePath}`);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();

    // Join voice channel
    if (content === '!join') {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('Join a voice channel first!');
    
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
            enableDAVE: false
        });
    
        message.reply('Joined voice channel! Recording everyone now...');
    
        const receiver = connection.receiver;
    
        // Subscribe to all users already in the channel
        channel.members.forEach((member) => {
            if (member.user.bot) return;
            startRecording(member.id, member.user.username, receiver);
        });
    
        // Subscribe to new users when they start speaking
        connection.on('speaking', (user, speaking) => {
            if (userStreams.has(user.id)) return;
            startRecording(user.id, user.username, receiver);
        });
    }

    // Leave voice channel
    if (content === '!leave') {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.reply('Left the voice channel.');
        }
    }

    // Stop recording and upload audio to Gemini (do not delete)
    if (content === '!stop') {
        if (userStreams.size === 0) return message.reply('No recordings in progress.');
        message.reply('Stopping recordings and preparing audio for Gemini...');

        const connection = getVoiceConnection(message.guild.id);
        const channel = message.member.voice.channel;
        const usernames = channel.members
            ?.filter(member => !member.user.bot)
            ?.map(member => member.user.username);

        // Stop all recordings first
        for (const [_, { audioStream }] of userStreams.entries()) {
            audioStream.destroy();
        }

        const recordings = [];

        for (const [userId, { audioStream, filePath, username }] of userStreams.entries()) {
            audioStream.destroy(); // stop recording

            const wavFile = filePath.replace('.pcm', '.wav');
            const ffmpeg = spawn('ffmpeg', [
                '-f', 's16le',
                '-ar', '48k',
                '-ac', '2',
                '-i', filePath,
                wavFile
            ]);
            recordings.push({ wavFile, username });

            ffmpeg.on('exit', async () => {
                try {
                    const uploadedFiles = [];
                    for (const rec of recordings) {
                        const myfile = await ai.files.upload({
                            file: rec.wavFile,
                            config: { mimeType: 'audio/wav' }
                        });
                        uploadedFiles.push({ uri: myfile.uri, mimeType: myfile.mimeType, username: rec.username });
                    }

                    // Upload to Gemini
                    const myfile = await ai.files.upload({
                        file: wavFile,
                        config: { mimeType: 'audio/wav' }
                    });

                    // Provide usernames for dialogue transcription
                    const prompt = `Transcribe the provided audio into a dialogue format using the actual Discord usernames of the participants. 
                            For each speaker, label their lines with their Discord username followed by a colon. 
                            Do not include timestamps, technical metadata, or any extra commentary. 
                            Only include what was said, formatted as a readable conversation. 
                            For example:

                            aryan_87259: Hello, how are you all?
                            friend123: I'm good, thanks! How about you?
                            gamerX: Hey everyone, ready for the game?

                            Ensure the conversation flows naturally.

                            Rules:
                            1. Use only the exact Discord usernames provided by the bot metadata for each speaker (for example: "siddharth", "aryan").
                            2. Do NOT invent or modify usernames (no numbers like siddharth_86386 or aryan_87259).
                            3. Format the output like this:
                            siddharth: Hello Aryan, how are you?
                            aryan: I'm fine, Siddharth. What about you?
                            4. Only include the spoken text (no timestamps, no explanations, no apologies, no extra text).
                            5. If a username is missing in the metadata, use a generic label like "UnknownUser" instead of inventing one.
                            6. Transcribe ONLY the actual spoken words from the provided audio segments.
                            7. Do NOT include timestamps, metadata, explanations, or any extra text.
                            8. Maintain a natural, readable dialogue structure.
                            9. Do NOT generate, imagine, or complete any sentences that are not clearly spoken.
                            10. Use only the exact Discord usernames from the metadata (for example: "aryan", "siddharth").
                            11. Combine all audio segments in their correct chronological order and create ONE single dialogue transcript.
                            12. Do NOT split the output into multiple files or sections.
                            13.If any part of the audio is unclear or silent, write “[inaudible]” instead of guessing.
                            14. using all audios provided, create one single dialogue transcript.
                            15. donot mess up with different audioi file use audio like if aryan.wav use for aryan only and siddhart.wav for siddharth only donot us aryan.wav audio in siddhart text this is important.
                            16. if user is not speaking in audio donot include them in transcript,if he speak in future only then on that timestamp include him.
                            
                            Each audio file belongs to a single user. Use the following mapping:
                            ${uploadedFiles.map(f => `${f.username}: ${f.uri}`).join('\n')}`
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: createUserContent([
                            ...uploadedFiles.map((f) => createPartFromUri(f.uri, f.mimeType)),
                            prompt
                        ])
                    });

                    // Save transcription per user
                    const transcriptsDir = path.join(__dirname, 'transcripts');
                    fs.mkdirSync(transcriptsDir, { recursive: true });
                    const transcriptFile = path.join(transcriptsDir, `transcript-${Date.now()}.txt`);
                    fs.writeFileSync(transcriptFile, response.text, 'utf8');

                    userStreams.clear();
                } catch (err) {
                    console.error(err);
                }
            });
        }

        userStreams.clear();
        message.channel.send('Recording stopped. Audio files saved and uploaded to Gemini.');
    }
});

client.login(process.env.DISCORD_TOKEN);
