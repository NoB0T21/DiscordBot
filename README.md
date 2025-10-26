# 🎙️ Discord Voice Transcription Bot (with Gemini AI)

A powerful **Discord bot** that records all users in a **voice channel**, converts their audio into text using **Google Gemini AI**, and saves the conversation in a **dialogue-style transcript**.
Each user’s speech is accurately labeled with their Discord username — creating clean, readable conversations directly from voice chats.

---

## 🚀 Features

* ✅ **Join & record any voice channel**
* 🎧 **Simultaneous recording** of all users
* 🧠 **Audio-to-text transcription** using **Gemini 2.5 Flash**
* 💬 **Dialogue formatting** with real usernames
* 📁 **Transcript saved as a single text file**
* 🔒 No AI hallucinations or username mismatches

---

## 🛠️ Tech Stack

| Component                | Description                                  |
| ------------------------ | -------------------------------------------- |
| **Discord.js v14**       | For bot interactions & voice connection      |
| **@discordjs/voice**     | Capturing real-time voice data               |
| **Prism-Media**          | Audio decoding (Opus → PCM → WAV)            |
| **FFmpeg**               | Converts raw PCM to WAV format               |
| **Google Gemini API**    | AI-based transcription & dialogue formatting |
| **Node.js + ES Modules** | Runtime and structure                        |
| **dotenv**               | Securely load environment variables          |

---

## ⚙️ Installation & Setup

### 1. Clone this repository

```bash
git clone https://github.com/yourusername/discord-gemini-transcriber.git
cd discord-gemini-transcriber
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```bash
speak
connect
Use Voice Activity
View Channels
Read Message
send Message History
```

### 3. Bot Permission

```bash
DISCORD_TOKEN=your_discord_bot_token
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ Keep your keys secret! Never commit `.env` files.

### 4. Run the bot

```bash
node index.js
```

---

## 🎮 Commands

| Command  | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| `!join`  | Bot joins your current voice channel and starts recording all members |
| `!stop`  | Stops recording, uploads audio to Gemini, and generates a transcript  |
| `!leave` | Disconnects the bot from the voice channel                            |

---

## 🧾 Output

When you run `!stop`, the bot:

1. Stops recording all members.
2. Converts each user’s PCM file to WAV.
3. Uploads all WAV files to Gemini.
4. Generates a **dialogue-style transcript** such as:

```
aryan: Hey Siddharth, how’s your day?
siddharth: Pretty good! How about you?
aryan: All fine, just testing the bot.
```

📝 The recording is saved automatically in:

```
/recording/recording-[timestamp].wav
```

📝 The transcript is saved automatically in:

```
/transcripts/transcript-[timestamp].txt
```

---

## 📁 Folder Structure

```
📦 discord-gemini-transcriber
 ┣ 📂 recordings
 ┣ 📂 transcripts
 ┣ 📜 index.js
 ┣ 📜 .env
 ┗ 📜 package.json
```

---

## ⚡ Notes

* Each user’s audio is recorded **continuously**, even during silence (for synchronization).
* The bot merges and transcribes all audio files into **one coherent conversation**.
* If the same user joins multiple times, their username and file are handled separately.
* Ensure **FFmpeg** is installed and available in your system PATH.

---

## 🧠 Example Use Case

Perfect for:

* Recording **Discord meetings**, **podcasts**, or **gaming sessions**
* Creating **AI-generated subtitles** or **meeting notes**
* Turning **voice discussions into text** automatically

---

## 👨‍💻 Author

**Aryan Gawade**
💬 Full Stack Developer | AI Enthusiast | Discord Automation

📧 [Contact on GitHub](https://github.com/NoB0T21)
   
🔗 [LinkedIn](https://www.linkedin.com/in/aryan-gawade-3723672ab/)

---

## 🪪 License

This project is open source under the **MIT License** — feel free to modify and share!

---

⭐ If you like this project, don’t forget to **star the repo** and share it with your community!
