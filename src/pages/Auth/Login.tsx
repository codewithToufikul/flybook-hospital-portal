import React, { useState } from 'react';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('info@evercarebd.com');
    setPassword('hospital123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #0d9488 0%, #090d16 55%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fff',
              boxShadow: '0 8px 24px var(--primary-glow)',
            }}
          >
            <Building2 size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Hospital Partner Portal
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            FlyBook Healthcare Management & Live Reception Desk
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              color: 'var(--rose-500)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Official Hospital / Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. info@evercarebd.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={18}
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '14px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Hospital Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', gap: '6px' }}
          >
            <Sparkles size={14} color="var(--primary-400)" />
            <span>Fill Demo Account (Evercare Hospital)</span>
          </button>
        </div> */}

        {/* Register Link */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Want to register your hospital or clinic?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-400)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Register Partner Account
          </button>
        </div>
      </div>
    </div>
  );
};
