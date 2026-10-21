import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Stethoscope,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ticket, TicketStatus } from '../../types';
import { api, API_BASE } from '../../services/api';

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onStatusUpdated: (updatedTicket: Ticket) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  onClose,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState(ticket?.hospitalRemarks || '');
  const [error, setError] = useState<string | null>(null);

  if (!ticket) return null;

  const handleUpdateStatus = async (status: TicketStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.updateTicketStatus(ticket._id, status, remarks);
      if (res.success && res.ticket) {
        if (status === 'completed') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        onStatusUpdated(res.ticket);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setLoading(false);
    }
  };

  const getFullPdfUrl = () => {
    if (!ticket.pdfUrl) return null;
    if (ticket.pdfUrl.startsWith('http')) return ticket.pdfUrl;
    return `${API_BASE}${ticket.pdfUrl}`;
  };

  const pdfUrl = getFullPdfUrl();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3>Patient Appointment Ticket</h3>
              <span className={`badge badge-${ticket.status || 'issued'}`}>
                {ticket.status || 'issued'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Ticket No: <strong>{ticket.ticketNumber}</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '10px',
                color: 'var(--rose-500)',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Card */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Patient Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--primary-500)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{ticket.userName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--emerald-500)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contact</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{ticket.userPhone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor & Schedule */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Appointment & Doctor
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={16} color="var(--indigo-500)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Doctor</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>Dr. {ticket.doctorName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{ticket.department}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--amber-500)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Date & Slot</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{ticket.appointmentDate}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{ticket.appointmentTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee & FlyBook Discount Box */}
          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              borderRadius: '14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--primary-400)' }}>
                <Percent size={14} /> FlyBook Exclusive Discount
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Original Fee: ৳{ticket.regularFee} • Discount: ৳{ticket.discountAmount} ({ticket.discountPercent}%)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payable at Counter</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald-500)' }}>
                ৳{ticket.finalFee}
              </div>
            </div>
          </div>

          {/* Hospital Remarks / Notes */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Hospital Remarks / Token No. (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Serial #12, Room 304, Seen by Dr. Assistant"
              className="form-input"
            />
          </div>

          {/* PDF Ticket Action */}
          {pdfUrl && (
            <div style={{ marginBottom: '10px' }}>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%', gap: '8px' }}
              >
                <FileText size={16} />
                <span>Open / Print Official PDF Receipt</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {ticket.status !== 'cancelled' && (
              <button
                disabled={loading}
                onClick={() => handleUpdateStatus('cancelled')}
                className="btn btn-sm"
                style={{ background: 'transparent', color: 'var(--rose-500)', border: 'none' }}
              >
                Cancel Ticket
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {ticket.status === 'issued' && (
              <button
                disabled={loading}
                onClick={() => handleUpdateStatus('arrived')}
                className="btn btn-primary"
              >
                <Clock size={16} />
                <span>Mark as Arrived (রিসেপশনে এসেছে)</span>
              </button>
            )}

            {ticket.status === 'arrived' && (
              <button
                disabled={loading}
                onClick={() => handleUpdateStatus('completed')}
                className="btn btn-success"
              >
                <CheckCircle2 size={16} />
                <span>Mark as Completed (চিকিৎসা শেষ)</span>
              </button>
            )}

            {ticket.status === 'completed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-500)', fontSize: '13px', fontWeight: 700 }}>
                <CheckCircle2 size={18} />
                <span>Patient Visit Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
