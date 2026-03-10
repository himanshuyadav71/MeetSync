# Realtime Meeting Platform (MeetSync)

A stunning, premium real-time video meeting platform built with the MERN stack (MongoDB, Express, React, Node.js) and WebRTC. Join up to 6+ participants seamlessly in responsive, crystal-clear video grids.

## Features
- **User Authentication**: Secure JWT-based signup and login system.
- **Instant Meetings**: Generate unique meeting rooms and URLs instantly.
- **Real-Time Video/Audio**: Peer-to-peer WebRTC connections for low-latency streaming.
- **Responsive Video Grid**: Dynamically resizes based on the number of participants.
- **In-Call Chat**: Real-time messaging within the meeting room via Socket.io.
- **Media Controls**: Easily toggle microphone and camera.
- **Beautiful UI**: Built with TailwindCSS and Lucide-react for a premium, lightweight feel.

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/` or update `.env`)

## Setup Instructions

### 1. Setup Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `backend/` directory (already created by setup) with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/realtime-meeting
   JWT_SECRET=supersecretjwtkey-change-in-production
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # OR
   npx nodemon server.js
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your browser (typically `http://localhost:5173`).

## Usage & Testing
1. **Signup/Login**: Create a new account from the landing page.
2. **Dashboard**: Once logged in, click "Create Meeting" to generate a new room.
3. **Join**: Copy the Room ID and open an incognito window or distinct browser (e.g., Chrome & Firefox). Login with a second account and enter the Room ID to join.
4. **Media Permissions**: Ensure both browsers have camera and microphone permissions enabled. Wait a moment for WebRTC to negotiate the connection.
5. **Chat**: Open the chat panel using the message icon to communicate in real-time.

## Architecture & WebRTC Flow
- **Signaling**: Handled via Socket.io Server in `backend/socket/signaling.js`. Relays WebRTC `offer`, `answer`, and `ice-candidate` packets.
- **Peer Connections**: Managed on the frontend in `src/hooks/useWebRTC.js`. Creates a new `RTCPeerConnection` per participant natively without relying on heavy WebRTC wrappers.
