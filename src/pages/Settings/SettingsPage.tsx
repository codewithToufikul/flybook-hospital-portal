import React, { useState, useEffect } from 'react';
import { Building2, Save, AlertCircle, CheckCircle2, Shield, Phone, MapPin, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { hospital, updateHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyPhone: '',
    city: 'Dhaka',
    address: '',
    defaultDiscountPercent: 15,
    departments: '',
    description: '',
  });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        phone: hospital.phone || '',
        emergencyPhone: hospital.emergencyPhone || '',
        city: hospital.city || 'Dhaka',
        address: hospital.address || '',
        defaultDiscountPercent: hospital.defaultDiscountPercent || 15,
        departments: Array.isArray(hospital.departments)
          ? hospital.departments.join(', ')
          : hospital.departments || '',
        description: hospital.description || '',
      });
    }
  }, [hospital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        departments: formData.departments.split(',').map((d) => d.trim()),
      };
      const res = await api.updateProfile(payload);
      if (res.success && res.hospital) {
        updateHospital(res.hospital);
        toast.success('Hospital settings updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hospital Profile & Settings</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Manage hospital contact details, emergency lines, departments, and FlyBook partnership agreements
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Building2 size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{hospital?.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Accredited Code: <strong>{hospital?.code}</strong> • Email: {hospital?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Reception / Helpline Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">24/7 Emergency Line</label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="e.g. 10678 or +880 1700..."
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Default FlyBook Discount (%)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={formData.defaultDiscountPercent}
                onChange={(e) => setFormData({ ...formData, defaultDiscountPercent: Number(e.target.value) })}
                className="form-input"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Applied automatically when new doctors are added
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Partner License Number</label>
              <input
                type="text"
                disabled
                value={hospital?.licenseNumber || 'DGHS-VERIFIED'}
                className="form-input"
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Medical Departments (comma-separated)</label>
            <textarea
              rows={3}
              value={formData.departments}
              onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: '8px' }}>
              <Save size={16} />
              <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
