import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../api/patientApi';
import { appointmentApi } from '../../api/appointmentApi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { User, Calendar, Stethoscope, FileText, Phone, Mail, RefreshCw } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  
  // Data States
  const [patientProfile, setPatientProfile] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadPatientData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      setError(err.customMessage || 'Failed to fetch patient dashboard records from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.patientId) {
      loadPatientData();
    }
  }, [user?.patientId]);

  const handleOpenDetailModal = (app) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader type="profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState title="System Sync Error" message={error} onRetry={() => loadPatientData(false)} />
      </div>
    );
  }

  const initial = patientProfile?.patientName?.trim().charAt(0) || user?.patientName?.trim().charAt(0) || 'P';
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingCount = myAppointments.filter(a => a.appointmentDate >= todayStr).length;
  const prescriptionsCount = myAppointments.filter(a => a.prescription).length;

  return (
    <div className="page-container animate-fade-in">
      {/* Welcome Banner */}
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="page-subtitle">Welcome back, {patientProfile?.patientName || user.patientName}. Here is your medical history.</p>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={refreshing}
          onClick={() => loadPatientData(true)}
          title="Refresh health records"
        >
          {refreshing ? 'Syncing...' : 'Refresh'}
        </Button>
      </div>

      {/* Health metrics overview */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Visits</span>
            <span className="stat-value">{myAppointments.length}</span>
          </div>
          <div className="stat-icon-wrapper emerald">
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Upcoming Visits</span>
            <span className="stat-value">{upcomingCount}</span>
          </div>
          <div className="stat-icon-wrapper blue">
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Prescriptions</span>
            <span className="stat-value">{prescriptionsCount}</span>
          </div>
          <div className="stat-icon-wrapper purple">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Profile Summary (Left) & Appointments (Right) */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Patient Profile Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            Personal Profile
          </h3>
          
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px', fontWeight: 'bold'
            }}>
              {initial}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{patientProfile?.patientName}</h4>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Registered Patient #{patientProfile?.patientId}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Number</div>
                <div style={{ fontWeight: 600 }}>{patientProfile?.phone || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recorded Age</div>
                <div style={{ fontWeight: 600 }}>{patientProfile?.age ? `${patientProfile.age} Years` : 'N/A'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Status</div>
              <span className="badge badge-emerald">
                Active Patient Account
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Appointment List */}
        <div className="card">
          <h3 className="card-title">Consultations History</h3>
          {myAppointments.length === 0 ? (
            <EmptyState 
              title="No Appointments" 
              description="You have no scheduled consultations on record."
            />
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Appointment ID</th>
                    <th>Date</th>
                    <th>Assigned Doctor</th>
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
        title="Consultation Details"
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
                  <span className="detail-label">Physician Name</span>
                  <span className="detail-value">{selectedApp.doctor?.doctorName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Specialization</span>
                  <span className="detail-value">{selectedApp.doctor?.specialization || 'General'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{selectedApp.doctor?.dept?.deptName || 'Unassigned'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Phone</span>
                  <span className="detail-value">{selectedApp.doctor?.phone || 'N/A'}</span>
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
                <FileText size={16} /> Prescription
              </h4>
              {selectedApp.prescription ? (
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                    Medicine: {selectedApp.prescription.medicine}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Dosage / Instructions: {selectedApp.prescription.Dosage || selectedApp.prescription.dosage}
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No prescription details recorded.</span>
              )}
            </div>

            <div className="form-actions" style={{ width: '100%', marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close Window
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientDashboard;
