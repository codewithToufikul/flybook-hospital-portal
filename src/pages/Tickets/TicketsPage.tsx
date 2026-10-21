import React, { useState, useEffect } from 'react';
import {
  Search,
  QrCode,
  Filter,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Ticket, TicketStatus } from '../../types';
import { api, API_BASE } from '../../services/api';

interface TicketsPageProps {
  onOpenTicket: (ticket: Ticket) => void;
  onOpenQRScanner: () => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({
  onOpenTicket,
  onOpenQRScanner,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.getTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
        search: search.trim() || undefined,
      });
      if (res.success && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const statusTabs = [
    { id: 'all', label: 'All Tickets' },
    { id: 'issued', label: 'Active / Waiting' },
    { id: 'arrived', label: 'Arrived at Hospital' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleQuickStatus = async (ticketId: string, status: TicketStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.updateTicketStatus(ticketId, status);
      if (res.success && res.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? res.ticket : t))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="page-container">
      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Patient Tickets & Appointments</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Track patient arrivals, verify ticket discounts, and manage chamber check-ins
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchTickets();
            }}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button onClick={onOpenQRScanner} className="btn btn-primary" style={{ gap: '8px' }}>
            <QrCode size={16} />
            <span>Verify Ticket (QR / Scanner)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Filter & Search */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, patient, phone..."
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '12px', width: '220px' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Search size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="panel">
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Ticket Info</th>
                <th>Patient Details</th>
                <th>Doctor & Specialization</th>
                <th>Appointment Slot</th>
                <th>FlyBook Fee</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading patient tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p>No tickets match the selected filters.</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => onOpenTicket(ticket)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--primary-400)', fontSize: '13px' }}>
                        #{ticket.ticketNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {new Date(ticket.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{ticket.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ticket.userPhone}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>Dr. {ticket.doctorName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{ticket.department}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{ticket.appointmentDate}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ticket.appointmentTime}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--emerald-500)', fontSize: '14px' }}>
                        ৳{ticket.finalFee}
                      </div>
                      <span className="badge badge-discount" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {ticket.discountPercent}% OFF
                      </span>
                    </td>

                    <td>
                      <span className={`badge badge-${ticket.status || 'issued'}`}>
                        {ticket.status || 'issued'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {ticket.status === 'issued' && (
                          <button
                            onClick={(e) => handleQuickStatus(ticket._id, 'arrived', e)}
                            className="btn btn-primary btn-sm"
                            title="Mark Patient Arrived"
                            style={{ padding: '5px 10px', fontSize: '11px' }}
                          >
                            <Clock size={12} />
                            <span>Arrived</span>
                          </button>
                        )}

                        {ticket.status === 'arrived' && (
                          <button
                            onClick={(e) => handleQuickStatus(ticket._id, 'completed', e)}
                            className="btn btn-success btn-sm"
                            title="Mark Visit Completed"
                            style={{ padding: '5px 10px', fontSize: '11px' }}
                          >
                            <CheckCircle2 size={12} />
                            <span>Done</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenTicket(ticket)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
