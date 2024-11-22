import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// const SOCKET_SERVER_URL = 'http://localhost:3000'; // Ganti jika berbeda
const SOCKET_SERVER_URL = 'https://bb95-202-51-121-109.ngrok-free.app'; // Ganti jika berbeda

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
