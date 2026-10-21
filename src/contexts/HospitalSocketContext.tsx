import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socket';
import { soundService } from '../services/sound';
import { Ticket, IncomingTicketNotification } from '../types';

interface HospitalSocketContextType {
  isConnected: boolean;
  incomingAlerts: IncomingTicketNotification[];
  unreadAlertCount: number;
  latestTicketAlert: Ticket | null;
  dismissLatestAlert: () => void;
  markAllAlertsAsRead: () => void;
  clearAlerts: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  playTestChime: () => void;
}

const HospitalSocketContext = createContext<HospitalSocketContextType | undefined>(undefined);

export const HospitalSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hospital } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [incomingAlerts, setIncomingAlerts] = useState<IncomingTicketNotification[]>([]);
  const [latestTicketAlert, setLatestTicketAlert] = useState<Ticket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundService.getSoundEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    soundService.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundService.playNewTicketChime();
      toast.success('Sound alerts enabled');
    } else {
      toast('Sound alerts muted', { icon: '🔇' });
    }
  };

  const playTestChime = () => {
    soundService.playNewTicketChime();
  };

  const dismissLatestAlert = () => {
    setLatestTicketAlert(null);
  };

  const markAllAlertsAsRead = () => {
    setIncomingAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const clearAlerts = () => {
    setIncomingAlerts([]);
    setLatestTicketAlert(null);
  };

  const unreadAlertCount = incomingAlerts.filter((a) => !a.read).length;

  useEffect(() => {
    if (!hospital?._id) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    const socket = socketService.connect(hospital._id);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // 🚨 Incoming Patient Ticket from FlyBook Admin
    const onIncomingTicket = (data: { ticket: Ticket; message?: string }) => {
      console.log('🔔 [Portal Socket] Incoming Ticket:', data);
      const ticket = data.ticket;

      // 1. Play alert chime
      soundService.playNewTicketChime();

      // 2. Set as prominent latest alert banner
      setLatestTicketAlert(ticket);

      // 3. Add to notifications history
      const newAlert: IncomingTicketNotification = {
        id: ticket._id || String(Date.now()),
        ticket,
        message: data.message || `New patient ticket #${ticket.ticketNumber} for Dr. ${ticket.doctorName}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setIncomingAlerts((prev) => [newAlert, ...prev]);

      // 4. Toast popup
      toast.custom(
        (t) => (
          <div
            className={`toast-incoming-alert ${t.visible ? 'animate-enter' : 'animate-leave'}`}
            onClick={() => {
              toast.dismiss(t.id);
              setLatestTicketAlert(ticket);
            }}
          >
            <div className="toast-icon">🚨</div>
            <div className="toast-content">
              <h4>New Appointment Ticket Issued!</h4>
              <p>
                <strong>{ticket.userName}</strong> for <strong>{ticket.doctorName}</strong>
              </p>
              <span className="toast-tag">#{ticket.ticketNumber} • {ticket.discountPercent}% Discount</span>
            </div>
          </div>
        ),
        { duration: 7000 }
      );
    };

    const onTicketStatusUpdated = (data: { ticketId: string; status: string; ticket?: Ticket }) => {
      soundService.playSuccessTone();
      toast.success(`Ticket status updated: ${data.status.toUpperCase()}`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('hospital:incoming_ticket', onIncomingTicket);
    socket.on('hospital:ticket_status_updated', onTicketStatusUpdated);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('hospital:incoming_ticket', onIncomingTicket);
      socket.off('hospital:ticket_status_updated', onTicketStatusUpdated);
    };
  }, [hospital?._id]);

  return (
    <HospitalSocketContext.Provider
      value={{
        isConnected,
        incomingAlerts,
        unreadAlertCount,
        latestTicketAlert,
        dismissLatestAlert,
        markAllAlertsAsRead,
        clearAlerts,
        soundEnabled,
        toggleSound,
        playTestChime,
      }}
    >
      {children}
    </HospitalSocketContext.Provider>
  );
};

export const useHospitalSocket = () => {
  const context = useContext(HospitalSocketContext);
  if (!context) {
    throw new Error('useHospitalSocket must be used within a HospitalSocketProvider');
  }
  return context;
};
