import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHospitalSocket } from '../../contexts/HospitalSocketContext';
import { Ticket } from '../../types';

interface HeaderProps {
  currentTab: string;
  onSelectTicket?: (ticket: Ticket) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTicket }) => {
  const { hospital } = useAuth();
  const {
    isConnected,
    unreadAlertCount,
    incomingAlerts,
    markAllAlertsAsRead,
    clearAlerts,
    soundEnabled,
    toggleSound,
    playTestChime,
  } = useHospitalSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Hospital Operations Hub', sub: 'Real-time monitoring and incoming patient flow' };
      case 'tickets':
        return { title: 'Patient Appointments & Tickets', sub: 'Issue verification, status tracking and check-in' };
      case 'doctors':
        return { title: 'Doctor Directory & Rosters', sub: 'Manage chamber schedules, fees and FlyBook discounts' };
      case 'reports':
        return { title: 'Financial Analytics & Invoices', sub: 'Patient volume, discounts and settlement statements' };
      case 'settings':
        return { title: 'Hospital Profile & Configuration', sub: 'Emergency contacts, department list and facility details' };
      default:
        return { title: 'Hospital Management', sub: 'FlyBook Healthcare Partner Portal' };
    }
  };

  const { title, sub } = getPageTitle();

  return (
    <header className="portal-header">
      {/* Title */}
      <div className="header-left">
        <div className="header-page-title">
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="header-right">
        {/* Realtime Live Socket Status */}
        <div className={`socket-status-pill ${isConnected ? '' : 'disconnected'}`}>
          <div className="pulse-dot" />
          <span>{isConnected ? 'Live Connected' : 'Reconnecting...'}</span>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleSound}
          className="btn-icon"
          title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts for new tickets'}
        >
          {soundEnabled ? <Volume2 size={18} color="#0d9488" /> : <VolumeX size={18} />}
        </button>

        {/* Test Chime Button */}
        <button
          onClick={playTestChime}
          className="btn-icon"
          title="Test Alert Chime Sound"
        >
          <Sparkles size={16} />
        </button>

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadAlertCount > 0) {
                markAllAlertsAsRead();
              }
            }}
            className="btn-icon"
            title="Incoming Patient Ticket Notifications"
          >
            <Bell size={18} />
            {unreadAlertCount > 0 && (
              <span className="icon-badge">{unreadAlertCount}</span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '380px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'slideDown 0.2s ease',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="#0d9488" />
                  <strong style={{ fontSize: '14px' }}>Live Incoming Alerts</strong>
                </div>
                {incomingAlerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {incomingAlerts.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '13px' }}>No new patient tickets right now.</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Tickets issued by FlyBook Admin will pop up here instantly.
                    </p>
                  </div>
                ) : (
                  incomingAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        if (onSelectTicket) onSelectTicket(alert.ticket);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                      className="portal-notification-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-400)' }}>
                          Ticket #{alert.ticket?.ticketNumber}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {alert.ticket?.userName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Dr. {alert.ticket?.doctorName} • {alert.ticket?.discountPercent}% FlyBook Discount
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hospital Admin Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '30px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hospital?.name?.charAt(0) || 'H'}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hospital?.adminName || 'Hospital Admin'}
          </div>
        </div>
      </div>
    </header>
  );
};
