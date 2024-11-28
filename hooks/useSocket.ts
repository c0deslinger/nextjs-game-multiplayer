import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// const SOCKET_SERVER_URL = 'http://localhost:3000'; // Ganti jika berbeda
const SOCKET_SERVER_URL = 'https://a48e-2404-c0-9ca0-00-22d1-7bd5.ngrok-free.app'; // Ganti jika berbeda

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
