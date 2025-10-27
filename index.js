import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { botJoinVC, botLeaveVC } from './Controllers/botComandController.js';


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

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();

    // Join voice channel
    if (content === '!join') {
        botJoinVC(message);
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
        botLeaveVC(message);
    }
});

client.login(process.env.DISCORD_TOKEN);
