import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  Banknote,
  Users,
  Percent,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { DashboardStats, Ticket } from '../../types';

export const ReportsPage: React.FC = () => {
  const { hospital } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getTickets(),
        ]);
        if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
        if (ticketsRes.success && ticketsRes.tickets) setTickets(ticketsRes.tickets);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      {/* Header */}
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
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Analytics & Settlement Reports</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Financial statements and patient volume through FlyBook Community Health Program
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-secondary" style={{ gap: '8px' }}>
          <Printer size={16} />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Gross Revenue</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Banknote size={20} />
            </div>
          </div>
          <div className="stat-card-value">৳{(stats?.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-card-subtitle">From FlyBook patient tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Discounts Subsidized</span>
            <div className="stat-card-icon" style={{ background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              <Percent size={20} />
            </div>
          </div>
          <div className="stat-card-value">৳{(stats?.totalDiscountGiven || 0).toLocaleString()}</div>
          <div className="stat-card-subtitle">Patient savings via partnership</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Referred Patients</span>
            <div className="stat-card-icon" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalTickets || 0}</div>
          <div className="stat-card-subtitle">{stats?.completedCount || 0} fully attended visits</div>
        </div>
      </div>

      {/* Settlement Statement Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Monthly Settlement & Billing Statement</h3>
            <p className="panel-subtitle">Comprehensive breakdown of all issued tickets</p>
          </div>
          <span className="badge badge-completed">● Verified Records</span>
        </div>

        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Issue Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Regular Fee</th>
                <th>Discount</th>
                <th>Payable Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No billing records found.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong style={{ color: 'var(--primary-400)' }}>#{t.ticketNumber}</strong>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>{t.userName}</td>
                    <td>Dr. {t.doctorName}</td>
                    <td>৳{t.regularFee}</td>
                    <td>
                      <span className="badge badge-discount">
                        -৳{t.discountAmount} ({t.discountPercent}%)
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--emerald-500)' }}>৳{t.finalFee}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status || 'issued'}`}>
                        {t.status || 'issued'}
                      </span>
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
