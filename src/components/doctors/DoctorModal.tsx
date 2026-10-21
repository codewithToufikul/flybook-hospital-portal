import React, { useState, useEffect } from 'react';
import { X, Stethoscope, AlertCircle, Save } from 'lucide-react';
import { Doctor } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DoctorModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onSaved: (savedDoctor: Doctor) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, onClose, onSaved }) => {
  const { hospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    qualification: 'MBBS, FCPS',
    department: 'General Medicine',
    regularFee: 1000,
    discountedFee: 850,
    visitingHours: '5:00 PM - 9:00 PM',
    visitingDays: 'Sunday, Monday, Wednesday, Thursday',
    roomNumber: 'Room 201',
    experience: '7+ Years',
    isActive: true,
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        qualification: doctor.qualification || '',
        department: doctor.department || '',
        regularFee: doctor.regularFee || 1000,
        discountedFee: doctor.discountedFee || 850,
        visitingHours: doctor.visitingHours || '',
        visitingDays: Array.isArray(doctor.visitingDays)
          ? doctor.visitingDays.join(', ')
          : doctor.visitingDays || '',
        roomNumber: doctor.roomNumber || '',
        experience: doctor.experience || '',
        isActive: doctor.isActive !== false,
      });
    } else {
      // Calculate initial discounted fee from hospital default discount
      const defaultDiscount = hospital?.defaultDiscountPercent || 15;
      const initialFee = 1000;
      setFormData((prev) => ({
        ...prev,
        regularFee: initialFee,
        discountedFee: Math.round(initialFee * (1 - defaultDiscount / 100)),
      }));
    }
  }, [doctor, hospital]);

  // Auto calculate discounted fee when regular fee changes
  const handleRegularFeeChange = (val: number) => {
    const discount = hospital?.defaultDiscountPercent || 15;
    const discounted = Math.round(val * (1 - discount / 100));
    setFormData((prev) => ({
      ...prev,
      regularFee: val,
      discountedFee: discounted,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialty.trim()) {
      setError('Doctor name and specialty are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        visitingDays: formData.visitingDays.split(',').map((d) => d.trim()),
      };

      if (doctor?._id) {
        const res = await api.updateDoctor(doctor._id, payload);
        if (res.success && res.doctor) {
          onSaved(res.doctor);
          onClose();
        }
      } else {
        const res = await api.addDoctor(payload);
        if (res.success && res.doctor) {
          onSaved(res.doctor);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={20} color="var(--primary-500)" />
            <h3>{doctor ? 'Edit Doctor Profile' : 'Add New Hospital Doctor'}</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Prof. Dr. Farhan Ahmed"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialty *</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g. Cardiology & Medicine"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Degrees & Qualifications</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, FCPS, MD (Cardiology)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Cardiology"
                  className="form-input"
                />
              </div>
            </div>

            {/* Fees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Regular Consultation Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.regularFee}
                  onChange={(e) => handleRegularFeeChange(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">FlyBook Discounted Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountedFee}
                  onChange={(e) => setFormData({ ...formData, discountedFee: Number(e.target.value) })}
                  className="form-input"
                />
                <span style={{ fontSize: '11px', color: 'var(--primary-400)' }}>
                  {hospital?.defaultDiscountPercent || 15}% Discount applied
                </span>
              </div>
            </div>

            {/* Visiting Days & Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Visiting Hours</label>
                <input
                  type="text"
                  value={formData.visitingHours}
                  onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
                  placeholder="e.g. 5:00 PM - 9:00 PM"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room / Chamber No.</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. Room 304, 3rd Floor"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Visiting Days (comma-separated)</label>
              <input
                type="text"
                value={formData.visitingDays}
                onChange={(e) => setFormData({ ...formData, visitingDays: e.target.value })}
                placeholder="e.g. Sunday, Monday, Wednesday, Thursday"
                className="form-input"
              />
            </div>

            {/* Active Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                type="checkbox"
                id="docActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-500)' }}
              />
              <label htmlFor="docActive" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Active for Appointments (Uncheck if doctor is on leave)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: '6px' }}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Doctor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
