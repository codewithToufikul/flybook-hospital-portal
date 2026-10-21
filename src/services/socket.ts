import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

class SocketService {
  private socket: Socket | null = null;
  private currentHospitalId: string | null = null;

  public connect(hospitalId: string): Socket {
    if (this.socket && this.currentHospitalId === hospitalId && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.currentHospitalId = hospitalId;
    this.socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });

    this.socket.on('connect', () => {
      console.log('⚡ [Portal Socket] Connected with ID:', this.socket?.id);
      if (hospitalId) {
        this.socket?.emit('hospital:join_portal', { hospitalId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚡ [Portal Socket] Disconnected:', reason);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      if (this.currentHospitalId) {
        this.socket.emit('hospital:leave_portal', { hospitalId: this.currentHospitalId });
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentHospitalId = null;
    }
  }
}

export const socketService = new SocketService();
