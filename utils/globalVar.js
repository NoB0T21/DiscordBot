export const userStreams = new Map();

export const promptText = (uploadedFiles) => {
    return `Transcribe all provided audio files into clean, structured text for AI voice training.

Each audio file corresponds to one specific Discord user:
${uploadedFiles.map(f => `${f.username}: ${f.uri}`).join('\n')}

Instructions:

1. Each line must begin with the exact Discord username followed by a colon and a space.  
   Example: aryan: Hello everyone!
2. Use only the provided usernames (for example: "${uploadedFiles.map(f => f.username).join('", "')}").
3. Combine all audio segments chronologically into one transcript.
4. Do not include timestamps, punctuation beyond normal conversational grammar, metadata, or explanations.
5. Only include clearly spoken words. If any part is unclear, write “[inaudible]”.
6. Maintain a natural conversation flow — alternate lines based on who is speaking.
7. Do NOT add, guess, or complete missing words or phrases.
8. Each user should only have text derived from their own audio (e.g., aryan.wav → aryan’s text only).
9. If a user is silent in a given audio, skip them until they speak.
10. Output format should be plain text suitable for AI model training — no Markdown, no JSON, no extra commentary.
11. The output must look like this example:

Example Output:
aryan: Hey Siddharth, can you hear me?
siddharth: Yeah, I can. How’s it going?
aryan: Pretty good, just testing this bot.
siddharth: Nice, seems to be working fine.

Now, transcribe all audio using these rules.

    
    Each audio file belongs to a single user. Use the following mapping:
    ${uploadedFiles.map(f => `${f.username}: ${f.uri}`).join('\n')}`
}

export const promptText2 = (uploadedFiles) => {
    return `
Transcribe the provided audio into a JSONL format suitable for AI voice and language model training.

Each audio file belongs to exactly one Discord user. Use only the exact usernames from the provided mapping.

For each spoken sentence or clear speech segment, output **one JSON object** in the following format:
{"speaker": "<username>", "text": "<spoken sentence>", "audio_file": "<audio file URI>", "emotion": "<detected emotion>", "language": "<detected language>"}

### Important Rules:
1. Use the exact usernames from the mapping. Do NOT invent, modify, or guess usernames.
2. Each audio file belongs only to its user. Use the correct \`audio_file\` for that speaker.
3. Do NOT include timestamps, system messages, metadata, or technical details.
4. If any part of audio is unclear, write:
   {"speaker": "<username>", "text": "[inaudible]", "audio_file": "<audio file URI>", "emotion": "unknown", "language": "unknown"}
5. Keep the dialogue natural and in chronological order across all audios.
6. Detect and include the primary emotion (e.g., "happy", "angry", "neutral", "sad", "excited") and spoken language (e.g., "English", "Hindi", "Marathi") for each line.
7. Output only raw JSONL lines — no Markdown, no explanations, no headers, and no extra text.
8. Each JSON object must be on a single line, properly formatted for JSONL.

User mapping:
${uploadedFiles.map(f => `${f.username}: ${f.uri}`).join('\n')}
`
}