import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const WriteFile = (response) => {
    const transcriptsDir = path.join(__dirname,'../assect', 'transcripts');
    fs.mkdirSync(transcriptsDir, { recursive: true });

    const transcriptFile = path.join(transcriptsDir, `transcript-${Date.now()}.txt`);
    const transcriptionText = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);

    if (!transcriptionText) {
        throw new Error("No text was returned from Gemini.");
    }
    
    fs.writeFileSync(transcriptFile, transcriptionText, 'utf8');

    const res ={
        transcriptFile,
        transcriptionText,
    }
    return res;
}