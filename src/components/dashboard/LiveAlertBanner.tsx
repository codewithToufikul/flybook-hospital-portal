import React from 'react';
import { Ticket as TicketIcon, Eye, X, CheckCircle, Percent } from 'lucide-react';
import { useHospitalSocket } from '../../contexts/HospitalSocketContext';
import { Ticket } from '../../types';

interface LiveAlertBannerProps {
  onOpenTicket: (ticket: Ticket) => void;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({ onOpenTicket }) => {
  const { latestTicketAlert, dismissLatestAlert } = useHospitalSocket();

  if (!latestTicketAlert) return null;

  return (
    <div className="live-alert-banner">
      <div className="live-alert-left">
        <div className="live-alert-icon">
          <TicketIcon size={22} />
        </div>
        <div className="live-alert-content">
          <h4>🚨 New Patient Ticket Just Issued by FlyBook Admin!</h4>
          <p>
            Patient: <strong>{latestTicketAlert.userName}</strong> ({latestTicketAlert.userPhone}) • Assigned to{' '}
            <strong>Dr. {latestTicketAlert.doctorName}</strong> ({latestTicketAlert.department})
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <span className="badge badge-issued">Ticket #{latestTicketAlert.ticketNumber}</span>
            <span className="badge badge-discount">
              <Percent size={11} /> {latestTicketAlert.discountPercent}% FlyBook Discount
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Fee: ৳{latestTicketAlert.finalFee}{' '}
              <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>৳{latestTicketAlert.regularFee}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="live-alert-actions">
        <button
          onClick={() => {
            onOpenTicket(latestTicketAlert);
            dismissLatestAlert();
          }}
          className="btn btn-primary btn-sm"
        >
          <Eye size={14} />
          <span>View & Process</span>
        </button>

        <button
          onClick={dismissLatestAlert}
          className="btn-icon"
          style={{ width: '32px', height: '32px' }}
          title="Dismiss Banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
