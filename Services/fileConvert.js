import { spawn } from 'child_process';

export function convertToWav(pcmPath, wavPath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-f', 's16le',
            '-ar', '48k',
            '-ac', '2',
            '-i', pcmPath,
            wavPath
        ]);

        ffmpeg.on('exit', (code) => {
            if (code === 0) {
                resolve(wavPath);
            } else {
                reject(new Error(`FFMPEG exited with code ${code}`));
            }
        });

        ffmpeg.on('error', (err) => {
            reject(err);
        });
    });
}