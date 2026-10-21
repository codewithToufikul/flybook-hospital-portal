import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Stethoscope,
  Clock,
  Calendar,
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Percent,
} from 'lucide-react';
import { Doctor } from '../../types';
import { api } from '../../services/api';

interface DoctorsPageProps {
  onOpenDoctorModal: (doctor: Doctor | null) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onOpenDoctorModal }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDoctors = async () => {
    try {
      const res = await api.getDoctors();
      if (res.success && res.doctors) {
        setDoctors(res.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleActive = async (doctor: Doctor) => {
    const updatedStatus = doctor.isActive === false ? true : false;
    try {
      const res = await api.updateDoctor(doctor._id, { isActive: updatedStatus });
      if (res.success && res.doctor) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === doctor._id ? res.doctor : d))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the hospital directory?')) {
      return;
    }
    try {
      await api.deleteDoctor(doctorId);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.department?.toLowerCase().includes(q)
    );
  });

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
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hospital Doctor Roster</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage consulting physicians, visiting schedules, room numbers, and discount rates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onOpenDoctorModal(null)}
            className="btn btn-primary"
            style={{ gap: '8px' }}
          >
            <UserPlus size={16} />
            <span>Add New Doctor</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '400px', position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialty, department..."
            className="form-input"
            style={{ paddingLeft: '38px', fontSize: '13px' }}
          />
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-dim)' }}
          />
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading hospital doctors...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Stethoscope size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3>No doctors found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Click "Add New Doctor" to list your hospital's doctors for FlyBook patient bookings.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="panel"
              style={{
                marginBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-normal)',
              }}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(13, 148, 136, 0.12)',
                        color: 'var(--primary-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Dr. {doc.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--primary-400)', fontWeight: 600 }}>
                        {doc.specialty}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{doc.qualification}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(doc)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    title={doc.isActive !== false ? 'Click to mark On Leave' : 'Click to mark Available'}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        background: doc.isActive !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: doc.isActive !== false ? '#10b981' : '#f43f5e',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {doc.isActive !== false ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {doc.isActive !== false ? 'Available' : 'On Leave'}
                    </span>
                  </button>
                </div>

                {/* Details List */}
                <div
                  style={{
                    padding: '12px',
                    background: 'var(--bg-surface)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Building size={14} color="var(--primary-500)" />
                    <span>{doc.department} • {doc.roomNumber || 'Chamber'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Clock size={14} color="var(--amber-500)" />
                    <span>{doc.visitingHours || 'Hours not set'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Calendar size={14} color="var(--indigo-500)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {Array.isArray(doc.visitingDays) ? doc.visitingDays.join(', ') : doc.visitingDays || 'All days'}
                    </span>
                  </div>
                </div>

                {/* Fee & Discount */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(13, 148, 136, 0.08)',
                    borderRadius: '10px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Regular Fee</div>
                    <div style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      ৳{doc.regularFee}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--primary-400)', fontWeight: 700 }}>
                      FlyBook Discounted Fee
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--emerald-500)' }}>
                      ৳{doc.discountedFee}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button
                  onClick={() => onOpenDoctorModal(doc)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, gap: '6px' }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="btn btn-sm"
                  style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-500)', border: 'none' }}
                  title="Remove Doctor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
