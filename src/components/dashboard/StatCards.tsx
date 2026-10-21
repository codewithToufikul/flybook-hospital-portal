import React from 'react';
import { CalendarCheck, Users, Banknote, Stethoscope, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatCardsProps {
  stats: DashboardStats | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Today's Patient Visits",
      value: stats?.todayTicketsCount || 0,
      sub: `${stats?.arrivedCount || 0} arrived in hospital today`,
      icon: CalendarCheck,
      color: '#0d9488',
      bg: 'rgba(13, 148, 136, 0.1)',
    },
    {
      title: 'Total Attended Patients',
      value: stats?.completedCount || 0,
      sub: `Out of ${stats?.totalTickets || 0} total issued tickets`,
      icon: Users,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Total Discount Savings Given',
      value: `৳${(stats?.totalDiscountGiven || 0).toLocaleString()}`,
      sub: 'Special subsidy via FlyBook Community',
      icon: Banknote,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.1)',
    },
    {
      title: 'Active Hospital Doctors',
      value: stats?.doctorCount || 0,
      sub: 'Available for FlyBook bookings',
      icon: Stethoscope,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">{card.title}</span>
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                <Icon size={20} />
              </div>
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-subtitle">
              <ArrowUpRight size={14} color={card.color} />
              <span>{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
