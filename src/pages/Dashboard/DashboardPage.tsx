import React, { useState, useEffect } from 'react';
import {
  QrCode,
  UserPlus,
  RefreshCw,
  Clock,
  ArrowRight,
  Stethoscope,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { DashboardStats, Ticket, Doctor } from '../../types';
import { LiveAlertBanner } from '../../components/dashboard/LiveAlertBanner';
import { StatCards } from '../../components/dashboard/StatCards';

interface DashboardPageProps {
  onOpenTicket: (ticket: Ticket) => void;
  onOpenQRScanner: () => void;
  onOpenAddDoctor: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenTicket,
  onOpenQRScanner,
  onOpenAddDoctor,
  onNavigateToTab,
}) => {
  const { hospital } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, docRes] = await Promise.all([
        api.getDashboardStats(),
        api.getDoctors(),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (docRes.success && docRes.doctors) {
        setDoctors(docRes.doctors);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="page-container">
      {/* 🚨 Live Incoming Ticket Banner (From FlyBook Admin) */}
      <LiveAlertBanner onOpenTicket={onOpenTicket} />

      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Welcome back, {hospital?.name}!</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Hospital Code: <strong>{hospital?.code}</strong> • FlyBook Discount Rate: <strong>{hospital?.defaultDiscountPercent || 15}%</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button onClick={onOpenQRScanner} className="btn btn-primary" style={{ gap: '8px' }}>
            <QrCode size={16} />
            <span>Verify Ticket (QR / Code)</span>
          </button>

          <button onClick={onOpenAddDoctor} className="btn btn-secondary" style={{ gap: '8px' }}>
            <UserPlus size={16} />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <StatCards stats={stats} />

      {/* Main Grid: Live Queue & Sidebar Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        {/* Left: Live Patient Reception Queue */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="panel-title">Today's Patient Queue & Incoming Tickets</h3>
                <span className="badge badge-issued">{stats?.recentTickets?.length || 0} Recent</span>
              </div>
              <p className="panel-subtitle">
                Tickets issued through FlyBook Community Health Desk
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('tickets')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <span>View All Tickets</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Ticket No</th>
                  <th>Patient</th>
                  <th>Doctor & Dept</th>
                  <th>Counter Fee</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!stats?.recentTickets || stats.recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p>No tickets issued yet today.</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        When FlyBook Admin issues an appointment receipt for your hospital, it will appear here immediately!
                      </p>
                    </td>
                  </tr>
                ) : (
                  stats.recentTickets.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <strong style={{ color: 'var(--primary-400)', fontSize: '12px' }}>
                          #{t.ticketNumber}
                        </strong>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>{t.userName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.userPhone}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>Dr. {t.doctorName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{t.department}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--emerald-500)' }}>৳{t.finalFee}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                          ৳{t.regularFee}
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${t.status || 'issued'}`}>
                          {t.status || 'issued'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenTicket(t)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px' }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Hospital Details & Doctors Roster */}
        <div>
          {/* Hospital Profile Summary */}
          <div className="panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{hospital?.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hospital?.city} • {hospital?.phone}</p>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(13, 148, 136, 0.1)',
                border: '1px solid rgba(13, 148, 136, 0.25)',
                borderRadius: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contracted Discount:</span>
                <strong style={{ color: 'var(--primary-400)' }}>{hospital?.defaultDiscountPercent || 15}% OFF</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                <span style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>● Active Partner</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Address: {hospital?.address || 'Dhaka, Bangladesh'}
            </div>
          </div>

          {/* Active Doctor Chamber Rosters */}
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="var(--primary-500)" />
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Doctor Chamber Rosters</h4>
              </div>
              <button
                onClick={() => onNavigateToTab('doctors')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-400)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View All ({doctors.length})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctors.slice(0, 4).map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>Dr. {doc.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {doc.specialty} • {doc.roomNumber || 'Chamber'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--emerald-500)' }}>
                      ৳{doc.discountedFee}
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: doc.isActive !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: doc.isActive !== false ? '#10b981' : '#f43f5e',
                        fontWeight: 700,
                      }}
                    >
                      {doc.isActive !== false ? 'Available' : 'On Leave'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
