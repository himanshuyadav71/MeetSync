import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? undefined : 'http://localhost:5000'); // undef lets socket.io default to window.location

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'], // Fallback enabled but websocket preferred
});

socket.on("connect_error", (err) => {
  console.log(`Socket.io connect_error due to ${err.message}`);
});
