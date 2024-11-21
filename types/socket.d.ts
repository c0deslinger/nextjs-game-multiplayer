import { Socket } from 'socket.io-client';

declare module 'socket.io-client' {
  export interface Socket {
    emit(event: string, ...args: any[]): Socket;
    on(event: string, callback: (...args: any[]) => void): Socket;
  }
}
