# 🤖 JARVIS – Your Personal AI Assistant

**JARVIS** is an AI-powered personal assistant designed to interact with users via natural language, capable of handling both text and voice input/output. Inspired by Marvel’s J.A.R.V.I.S., this project brings intelligent automation and conversational experiences to your everyday life. From remembering key moments to suggesting the right questions at the right time, JARVIS continuously evolves to better assist you.

---

## 🔥 Features

- 🧠 AI-Powered Conversations using Google Gemini API
- 🎙️ Voice Input with Web Speech API
- 🔊 Voice Output using Web Speech Synthesis API
- 🔐 Secure User Authentication with Passport.js
- 💬 Chat System with Saved Conversations
- 🧾 Dynamic Conversation and Contextual Replies
- 📅 **Weekly Reflection** – Get summaries and insights from your weekly interactions
- 💡 **Proactive Question Suggestions** – JARVIS prompts meaningful questions based on context
- 🧠 **Memory Management** – Save and retrieve contextual memories to maintain long-term context
- ⚙️ **Background Job Handling** – Scheduled tasks and delayed processing powered by BullMQ
- 📌 **Vector-Based Memory Storage** – Context and memories stored using Qdrant vector database
- 🧾 **Real time web search** - Real time web search for accurate and latest information
- 📦 Built with MERN Stack (MongoDB, Express.js, React, Node.js)

---

## ⚙️ Technologies Used

### Frontend:
- React.js + Vite
- Material UI (MUI)
- Web Speech API (for STT and TTS)
- Axios
- socket.io-client

### Backend:
- Node.js
- Express.js
- Passport.js + Passport-Local
- MongoDB + Mongoose
- **BullMQ** – For background job scheduling and queue management
- **Qdrant** – High-performance vector database for storing and querying user memory embeddings
- **Socket.io** - Real time req processing indicators

### AI & External APIs:
- Google Gemini API
- Web Speech Synthesis API
- Serp API for Real time web search

---

## 🚀 Coming Soon

- File and document analysis (PDFs, CSVs, JSON)
- Emotion-aware response generation
- Mobile app + cross-device sync
- Custom plugin builder and third-party integrations
- Fine-grained control over memory and tool permissions

---
