import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Stethoscope, Calendar, User, FileText, Phone, Building } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();

  const formatDocName = (name) => {
    if (!name) return '';
    return name.toLowerCase().startsWith('dr. ') ? name : `Dr. ${name}`;
  };
  
  // Data States
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadDoctorData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile & appointments in parallel
      const [profileData, allAppointments] = await Promise.all([
        doctorApi.getById(user.doctorId),
        appointmentApi.getAll()
      ]);

      setDoctorProfile(profileData);
      
      // Filter appointments that belong to this doctor
      const filtered = (allAppointments || []).filter(
        app => app.doctor?.doctorId === user.doctorId
      );
      
      // Sort by date descending
      filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      setMyAppointments(filtered);
    } catch (err) {
      setError('Failed to fetch doctor dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [user.doctorId]);

  const handleOpenDetailModal = (app) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader text="Loading your dashboard clinical data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState title="System Sync Error" message={error} onRetry={loadDoctorData} />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="page-subtitle">Welcome back, {formatDocName(doctorProfile?.doctorName || user.doctorName)}. Here is your clinical schedule.</p>
        </div>
      </div>

      {/* Grid: Profile Summary (Left) & Live Appointments (Right) */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Doctor Profile Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
            Physician Profile
          </h3>
          
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', fontWeight: 'bold'
            }}>
              {doctorProfile?.doctorName?.charAt(0) || 'D'}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{formatDocName(doctorProfile?.doctorName)}</h4>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{doctorProfile?.specialization}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Building size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontWeight: 600 }}>{doctorProfile?.dept?.deptName || 'Unassigned'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Mobile</div>
                <div style={{ fontWeight: 600 }}>{doctorProfile?.phone || 'N/A'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Qualifications</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {doctorProfile?.speciality && doctorProfile.speciality.length > 0 ? (
                  doctorProfile.speciality.map(s => (
                    <span key={s.specialityId} className="badge badge-indigo">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None registered</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Appointment List */}
        <div className="card">
          <h3 className="card-title">Patient Consultations Schedule</h3>
          {myAppointments.length === 0 ? (
            <EmptyState 
              title="No Consultations Booked" 
              description="No patients are currently scheduled under your care."
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Slot ID</th>
                    <th>Date</th>
                    <th>Patient Name</th>
                    <th>Prescription Med</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map(app => (
                    <tr key={app.appointmentId}>
                      <td style={{ fontWeight: 600 }}>#{app.appointmentId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{app.appointmentDate}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          <strong>{app.patient?.patientName || 'Unknown Patient'}</strong>
                        </div>
                      </td>
                      <td>
                        {app.prescription ? (
                          <span className="badge badge-blue">
                            {app.prescription.medicine}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleOpenDetailModal(app)}
                        >
                          View Case
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Case Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Consultation Case Inspector"
        size="md"
      >
        {selectedApp && (
          <div className="confirm-dialog-content" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
            {/* Patient Segment */}
            <div style={{ width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> Patient Information
              </h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedApp.patient?.patientName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{selectedApp.patient?.age ? `${selectedApp.patient.age} Yrs` : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedApp.patient?.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Record ID</span>
                  <span className="detail-value">#{selectedApp.patient?.patientId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Appointment Segment */}
            <div style={{ width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Appointment Slot
              </h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Appointment ID</span>
                  <span className="detail-value">#{selectedApp.appointmentId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Scheduled Date</span>
                  <span className="detail-value">{selectedApp.appointmentDate}</span>
                </div>
              </div>
            </div>

            {/* Prescription Segment */}
            <div style={{ width: '100%' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Linked Prescription Plan
              </h4>
              {selectedApp.prescription ? (
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                    Medicine: {selectedApp.prescription.medicine}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Dosage: {selectedApp.prescription.Dosage || selectedApp.prescription.dosage}
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No prescription details attached.</span>
              )}
            </div>

            <div className="form-actions" style={{ width: '100%', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
