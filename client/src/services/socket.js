import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://trelloclone-backend.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('[Socket] Connected to real-time server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.warn('[Socket] Real-time connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected from server:', reason);
});

export default socket;

