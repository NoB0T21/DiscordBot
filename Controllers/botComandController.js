import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { promptText, userStreams } from '../utils/globalVar.js';
import { fileToGenerativePart } from '../Services/fileToGenerativePart.js';
import { getVoiceConnection } from '@discordjs/voice';
import { joinVoiceChannel } from '@discordjs/voice';
import { convertToWav } from '../Services/fileConvert.js';
import {startRecording} from '../Services/recording.js'
import { GoogleGenAI } from "@google/genai";
import { WriteFile } from '../Services/writeTextFile.js';

// Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const botJoinVC = (message) => {
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
    connection.on('speaking', (user) => {
        if (userStreams.has(user.id)) return;
        const member = channel.guild.members.cache.get(user.id);
        startRecording(user.id, user.username, receiver);
    });
}

export const botStopRec = async (message) => {
    if (userStreams.size === 0) return message.reply('No recordings in progress.');
        message.reply('Stopping recordings and preparing audio for Gemini...');

        const connection = getVoiceConnection(message.guild.id);

        // Stop all recordings first
        for (const [_, { audioStream }] of userStreams.entries()) {
            audioStream.destroy();// stop recording
        }

        const recordings = [];
        const conversionPromises = [];

        for (const [userId, { audioStream, filePath, username }] of userStreams.entries()) {
            audioStream.destroy(); // stop recording

            if (filePath) {
                const wavFile = filePath.replace('.pcm', '.wav');
                recordings.push({ pcmFile: filePath, wavFile, username });
                conversionPromises.push(convertToWav(filePath, wavFile));
            } else {
                console.warn(`Skipping user ${username} (ID: ${userId}) due to missing filePath.`);
            }
        }

        try {
            await Promise.all(conversionPromises);
            message.reply('All audio converted. Uploading to Gemini...');

            const uploadedFiles = [];
            
            let validAudioFiles = 0;
            for (const rec of recordings) {
                try{
                    if (fs.existsSync(rec.wavFile) && fs.statSync(rec.wavFile).size > 1024) {
                        const parts = fileToGenerativePart(rec.wavFile, rec.username);
                        uploadedFiles.push(...parts);
                        validAudioFiles++;
                    }else {
                        message.reply(`Skipping empty or missing file ${rec.wavFile} for ${rec.username}`);
                    }
                }catch (uploadError) {
                    message.channel.send(`⚠️ Failed to upload audio for ${rec.username}.`);
                }
            }
            
            if (uploadedFiles.length === 0) {
                return message.reply('No audio files were successfully uploaded. Cannot transcribe.');
            }

            const prompt = promptText(uploadedFiles)

            const result = await ai.models.generateContent({ 
                model: "gemini-2.0-flash-exp",
                contents: [{ 
                    role: "user", 
                    parts: [
                        { text: prompt },
                        ...uploadedFiles
                    ]
                }],
            });

            const response = result.candidates[0].content.parts[0];

            // Save transcription per user
            const res = WriteFile(response);
            message.channel.send(`Transcription complete! Saved to \`${path.basename(res.transcriptFile)}\``);
        
            // Send the transcription to the channel if it's not too long
            if (res.transcriptionText.length < 2000) {
                message.channel.send("```\n" + res.transcriptionText + "\n```");
            } else {
                message.channel.send("The transcript is too long to display here.");
            }
        } catch (err) {
            message.channel.send('❌ An error occurred while processing the recordings.');
        }finally {
        userStreams.clear();
        for (const rec of recordings) {
            // Add a check to prevent crash if pcmFile path is bad
            if (rec.pcmFile) {
                // This line deletes the original .pcm file
                fs.unlink(rec.pcmFile, (e) => e && console.error(`Failed to delete pcm: ${e.message}`));
            }
        }
        if (connection) {
            connection.disconnect();
            connection.destroy();
        }
    }
}

export const botLeaveVC = async (message) => {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
        connection.destroy();
        message.reply('Left the voice channel.');
    }
}