import React from 'react';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHospitalSocket } from '../../contexts/HospitalSocketContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { hospital, logout, theme, toggleTheme } = useAuth();
  const { unreadAlertCount } = useHospitalSocket();

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    {
      id: 'tickets',
      label: 'Patient Tickets',
      icon: TicketIcon,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    { id: 'doctors', label: 'Doctor Directory', icon: UserCheck },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Hospital Settings', icon: Settings },
  ];

  return (
    <aside className="portal-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Building2 size={24} />
        </div>
        <div className="brand-text">
          <h3>FlyBook Hospital</h3>
          <span>Partner Management</span>
        </div>
      </div>

      {/* Hospital Identity Badge */}
      <div className="sidebar-hospital-badge">
        <ShieldCheck size={20} className="badge-icon" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="badge-name" title={hospital?.name || 'Hospital'}>
            {hospital?.name || 'Hospital Portal'}
          </div>
          <div className="badge-code">Code: {hospital?.code || 'FB-HOSP'}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-count-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="sidebar-footer">
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
          title="Sign out of hospital account"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
