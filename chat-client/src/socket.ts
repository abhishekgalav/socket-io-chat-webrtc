import { io } from 'socket.io-client';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(API_URL, {
  autoConnect: false,
});

export const connectSocket = (token: string) => {
  console.log('Connecting socket...');

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};