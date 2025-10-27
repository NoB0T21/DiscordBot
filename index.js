import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { botJoinVC, botLeaveVC, botStopRec } from './Controllers/botComandController.js';


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
        botLeaveVC(message);
    }

    // Stop recording and upload audio to Gemini (do not delete)
    if (content === '!stop') {
        botStopRec(message);
    }
});

client.login(process.env.DISCORD_TOKEN);
