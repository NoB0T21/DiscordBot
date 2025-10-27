import fs from 'fs';

export function fileToGenerativePart(filePath, username) {
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    return [
        { text: `This is an audio file from the user: ${username}` },
        {
            inlineData: {
                mimeType: 'audio/wav',
                data: base64Data
            }
        }
    ];
}
