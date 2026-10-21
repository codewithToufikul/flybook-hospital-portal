import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HospitalSocketProvider } from './contexts/HospitalSocketContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { TicketsPage } from './pages/Tickets/TicketsPage';
import { DoctorsPage } from './pages/Doctors/DoctorsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { TicketDetailsModal } from './components/tickets/TicketDetailsModal';
import { QRScannerModal } from './components/tickets/QRScannerModal';
import { DoctorModal } from './components/doctors/DoctorModal';
import { Ticket, Doctor } from './types';

const MainPortal: React.FC = () => {
  const { hospital, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Modal States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--primary-400)',
          fontSize: '16px',
          fontWeight: 700,
        }}
      >
        Connecting to FlyBook Hospital System...
      </div>
    );
  }

  // Not authenticated
  if (!hospital) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="portal-layout">
      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="portal-main">
        <Header currentTab={currentTab} onSelectTicket={(t) => setSelectedTicket(t)} />

        {/* Tab Pages */}
        {currentTab === 'dashboard' && (
          <DashboardPage
            onOpenTicket={(t) => setSelectedTicket(t)}
            onOpenQRScanner={() => setShowQRScanner(true)}
            onOpenAddDoctor={() => {
              setEditingDoctor(null);
              setShowDoctorModal(true);
            }}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'tickets' && (
          <TicketsPage
            onOpenTicket={(t) => setSelectedTicket(t)}
            onOpenQRScanner={() => setShowQRScanner(true)}
          />
        )}

        {currentTab === 'doctors' && (
          <DoctorsPage
            onOpenDoctorModal={(doc) => {
              setEditingDoctor(doc);
              setShowDoctorModal(true);
            }}
          />
        )}

        {currentTab === 'reports' && <ReportsPage />}

        {currentTab === 'settings' && <SettingsPage />}
      </div>

      {/* --- Global Modals --- */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusUpdated={(updated) => {
            setSelectedTicket(updated);
          }}
        />
      )}

      {showQRScanner && (
        <QRScannerModal
          onClose={() => setShowQRScanner(false)}
          onTicketFound={(ticket) => {
            setSelectedTicket(ticket);
          }}
        />
      )}

      {showDoctorModal && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={() => setShowDoctorModal(false)}
          onSaved={() => {
            setShowDoctorModal(false);
          }}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HospitalSocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
            },
          }}
        />
        <MainPortal />
      </HospitalSocketProvider>
    </AuthProvider>
  );
}

export default App;
