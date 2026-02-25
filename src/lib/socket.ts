import { io } from 'socket.io-client';

import { SERVER_URL } from './api';

const SOCKET_URL = SERVER_URL;

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = (userId: string) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit('register', userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
