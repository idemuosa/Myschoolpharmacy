import { io } from 'socket.io-client';

// Connect to the Node.js websocket backend created earlier
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to WebSocket backend:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket backend');
});
