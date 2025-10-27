export const userStreams = new Map();

export const promptText = (uploadedFiles) => {
    return `Transcribe the provided audio into a dialogue format.
    Each audio file belongs to a single user. Use the following mapping:
    ${uploadedFiles.map(f => `${f.username}: ${f.uri}`).join('\n')}.
    using the actual Discord usernames of the participants. 
    For each speaker, label their lines with their Discord username followed by a colon. 
    Do not include timestamps, technical metadata, or any extra commentary. 
    Only include what was said, formatted as a readable conversation. 
    Use only the exact Discord usernames (e.g., "${uploadedFiles.map(f => f.username).join('", "')}")

    Ensure the conversation flows naturally.

    Rules:
    1. Use only the exact Discord usernames provided by the bot metadata for each speaker (for example: "siddharth", "aryan").
    2. Do NOT invent or modify usernames (no numbers like siddharth_86386 or aryan_87259).
    3. Format: \`username: text\`
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
}