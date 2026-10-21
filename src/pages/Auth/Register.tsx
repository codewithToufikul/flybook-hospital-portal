import React, { useState } from 'react';
import { Building2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hospitalName: '',
    adminName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Dhaka',
    address: '',
    departments: 'General Medicine, Cardiology, Neurology, Pediatrics, Emergency',
    defaultDiscountPercent: 15,
    licenseNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Hospital name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        departments: formData.departments.split(',').map((d) => d.trim()),
      };
      await register(payload);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #0d9488 0%, #090d16 55%)',
        padding: '32px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
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
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Register Hospital Account</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Join FlyBook Healthcare Network as an accredited partner
              </p>
            </div>
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Full Name *</label>
              <input
                type="text"
                required
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                placeholder="e.g. Evercare Hospital Dhaka"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Authorized Manager / Admin Name</label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="e.g. Dr. Kazi Rahman"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. info@hospital.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Contact / Hotline Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +880 1711 000000"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-select"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address / Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 81, Block E, Bashundhara R/A, Dhaka"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Default FlyBook Discount (%)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.defaultDiscountPercent}
                onChange={(e) => setFormData({ ...formData, defaultDiscountPercent: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Govt. License / Reg. No. (Optional)</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="e.g. DGHS-2024-8842"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Departments (comma-separated)</label>
            <input
              type="text"
              value={formData.departments}
              onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '14px' }}
          >
            <span>{loading ? 'Creating Hospital Profile...' : 'Complete Registration & Open Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
