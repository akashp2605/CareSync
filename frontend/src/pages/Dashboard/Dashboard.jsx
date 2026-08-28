import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Building2,
  CalendarRange,
  FileSpreadsheet,
  Award,
  Plus,
  ArrowRight,
  Clock
} from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { doctorApi } from '../../api/doctorApi';
import { departmentApi } from '../../api/departmentApi';
import { specialityApi } from '../../api/specialityApi';
import { appointmentApi } from '../../api/appointmentApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    patients: 0,
    doctors: 0,
    departments: 0,
    specialities: 0,
    appointments: 0,
    prescriptions: 0
  });
  
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Promise.allSettled to load all stats in parallel
      // Even if one API fails, we can display partial counts
      const results = await Promise.allSettled([
        patientApi.getAll(),
        doctorApi.getAll(),
        departmentApi.getAll(),
        specialityApi.getAll(),
        appointmentApi.getAll(),
        prescriptionApi.getAll()
      ]);

      const data = {
        patients: results[0].status === 'fulfilled' ? results[0].value.length : 'Error',
        doctors: results[1].status === 'fulfilled' ? results[1].value.length : 'Error',
        departments: results[2].status === 'fulfilled' ? results[2].value.length : 'Error',
        specialities: results[3].status === 'fulfilled' ? results[3].value.length : 'Error',
        appointments: results[4].status === 'fulfilled' ? results[4].value.length : 'Error',
        prescriptions: results[5].status === 'fulfilled' ? results[5].value.length : 'Error'
      };

      setCounts(data);

      if (results[4].status === 'fulfilled') {
        // Sort appointments by date descending and take top 5
        const sorted = [...results[4].value].sort((a, b) => {
          return new Date(b.appointmentDate) - new Date(a.appointmentDate);
        });
        setRecentAppointments(sorted.slice(0, 5));
      } else {
        setRecentAppointments([]);
      }
    } catch (err) {
      setError('Could not connect to the backend server. Make sure Java Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loader text="Loading dashboard analytics..." />
      </div>
    );
  }

  // If all endpoints failed due to backend down
  const allFailed = Object.values(counts).every(val => val === 'Error');
  if (allFailed || error) {
    return (
      <div className="page-container">
        <ErrorState 
          title="Backend Integration Error" 
          message={error || "Failed to load metrics. Please verify that the backend server is running at http://localhost:8080."} 
          onRetry={fetchDashboardData} 
        />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Doctors', value: counts.doctors, icon: Stethoscope, color: 'blue', link: '/doctors' },
    { label: 'Total Patients', value: counts.patients, icon: Users, color: 'emerald', link: '/patients' },
    { label: 'Total Departments', value: counts.departments, icon: Building2, color: 'indigo', link: '/departments' },
    { label: 'Total Specialities', value: counts.specialities, icon: Award, color: 'amber', link: '/specialities' },
    { label: 'Total Appointments', value: counts.appointments, icon: CalendarRange, color: 'rose', link: '/appointments' },
    { label: 'Total Prescriptions', value: counts.prescriptions, icon: FileSpreadsheet, color: 'purple', link: '/prescriptions' }
  ];

  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Hospital Overview</h1>
        <p className="page-subtitle">Real-time statistics and administrative overview of hospital operations.</p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card" onClick={() => navigate(card.link)} style={{ cursor: 'pointer' }}>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
            <div className={`stat-icon-wrapper ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Actions & Activity Grid */}
      <div className="dashboard-layout">
        {/* Left Side: Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Recent Appointments</h3>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={ArrowRight} 
              onClick={() => navigate('/appointments')}
            >
              View All
            </Button>
          </div>

          {recentAppointments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
              <p>No recent appointments recorded.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((app) => (
                    <tr key={app.appointmentId}>
                      <td style={{ fontWeight: 600 }}>#{app.appointmentId}</td>
                      <td>{app.patient?.patientName || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                      <td>{app.doctor?.doctorName || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                      <td>{app.appointmentDate}</td>
                      <td>
                        <span className={`badge ${new Date(app.appointmentDate) >= new Date().setHours(0,0,0,0) ? 'badge-emerald' : 'badge-blue'}`}>
                          {new Date(app.appointmentDate) >= new Date().setHours(0,0,0,0) ? 'Upcoming' : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">Quick Actions</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Common administrative workflows to manage patients, doctors, and schedulers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <Button 
              variant="secondary" 
              icon={Plus} 
              onClick={() => navigate('/patients', { state: { openAddModal: true } })}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
            >
              Add New Patient
            </Button>
            <Button 
              variant="secondary" 
              icon={Plus} 
              onClick={() => navigate('/doctors', { state: { openAddModal: true } })}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
            >
              Register Doctor
            </Button>
            <Button 
              variant="secondary" 
              icon={Plus} 
              onClick={() => navigate('/appointments', { state: { openAddModal: true } })}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
            >
              Book Appointment
            </Button>
            <Button 
              variant="secondary" 
              icon={Plus} 
              onClick={() => navigate('/departments', { state: { openAddModal: true } })}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '12px 16px' }}
            >
              Create Department
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
