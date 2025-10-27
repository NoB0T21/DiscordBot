import prism from 'prism-media';
import fs from 'fs';
import path from 'path';
import { EndBehaviorType } from '@discordjs/voice';
import { fileURLToPath } from 'url';
import { userStreams } from '../utils/globalVar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function startRecording(userId, username, receiver) {
    const audioStream = receiver.subscribe(userId, {
        end: { behavior: EndBehaviorType.Manual }
    });

    const recordingsDir = path.join(__dirname,'..', 'recordings');
    fs.mkdirSync(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `${username}-${userId}-${Date.now()}.pcm`);
    const pcmStream = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });

    // prevent crashes from invalid/corrupt opus frames
    pcmStream.on('error', (err) => {
        console.warn(`Decoder error for ${username}: ${err.message}`);
    });

    audioStream.on('error', (err) => {
        console.warn(`Audio stream error for ${username}: ${err.message}`);
    });

    const writeStream = fs.createWriteStream(filePath);
    audioStream.pipe(pcmStream).pipe(writeStream);

    userStreams.set(userId, { audioStream, filePath, username });
    console.log(`${username} recording started: ${filePath}`);
}