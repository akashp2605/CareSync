import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../api/patientApi';
import { appointmentApi } from '../../api/appointmentApi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { User, Calendar, Stethoscope, FileText, Phone, Mail } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  // Data States
  const [patientProfile, setPatientProfile] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile & appointments in parallel
      const [profileData, allAppointments] = await Promise.all([
        patientApi.getById(user.patientId),
        appointmentApi.getAll()
      ]);

      setPatientProfile(profileData);
      
      // Filter appointments that belong to this patient
      const filtered = (allAppointments || []).filter(
        app => app.patient?.patientId === user.patientId
      );
      
      // Sort by date descending
      filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      setMyAppointments(filtered);
    } catch (err) {
      setError('Failed to fetch patient dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [user.patientId]);

  const handleOpenDetailModal = (app) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader text="Loading your medical records..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState title="System Sync Error" message={error} onRetry={loadPatientData} />
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
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="page-subtitle">Welcome back, {patientProfile?.patientName || user.patientName}. Here is your medical history.</p>
        </div>
      </div>

      {/* Grid: Profile Summary (Left) & Appointments (Right) */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Patient Profile Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            Patient Profile
          </h3>
          
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', fontWeight: 'bold'
            }}>
              {patientProfile?.patientName?.charAt(0) || 'P'}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{patientProfile?.patientName}</h4>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Patient Record</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile</div>
                <div style={{ fontWeight: 600 }}>{patientProfile?.phone || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontWeight: 600 }}>{patientProfile?.email || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age</div>
                <div style={{ fontWeight: 600 }}>{patientProfile?.age || 'N/A'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Blood Group</div>
              <span className="badge badge-indigo">
                {patientProfile?.bloodGroup || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Appointment List */}
        <div className="card">
          <h3 className="card-title">Your Appointments</h3>
          {myAppointments.length === 0 ? (
            <EmptyState 
              title="No Appointments" 
              description="You have no scheduled appointments with doctors."
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Appointment ID</th>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Prescription</th>
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
                          <Stethoscope size={14} style={{ color: 'var(--text-muted)' }} />
                          <strong>{app.doctor?.doctorName || 'Unknown Doctor'}</strong>
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
                          View Details
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

      {/* Appointment Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Appointment Details"
        size="md"
      >
        {selectedApp && (
          <div className="confirm-dialog-content" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 0 }}>
            {/* Doctor Segment */}
            <div style={{ width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={16} /> Doctor Information
              </h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedApp.doctor?.doctorName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Specialization</span>
                  <span className="detail-value">{selectedApp.doctor?.specialization || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedApp.doctor?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Appointment Segment */}
            <div style={{ width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Appointment Details
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
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{selectedApp.status || 'Scheduled'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reason</span>
                  <span className="detail-value">{selectedApp.reason || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Prescription Segment */}
            <div style={{ width: '100%' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Prescription
              </h4>
              {selectedApp.prescription ? (
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                    Medicine: {selectedApp.prescription.medicine}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Dosage: {selectedApp.prescription.Dosage || selectedApp.prescription.dosage}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Instructions: {selectedApp.prescription.instructions || 'N/A'}
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No prescription details available.</span>
              )}
            </div>

            <div className="form-actions" style={{ width: '100%', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientDashboard;
