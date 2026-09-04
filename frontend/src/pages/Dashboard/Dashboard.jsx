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
  Clock,
  RefreshCw,
  Calendar
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
  const [deptStaffing, setDeptStaffing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch all endpoints in parallel using Promise.allSettled
      const results = await Promise.allSettled([
        patientApi.getAll(),
        doctorApi.getAll(),
        departmentApi.getAll(),
        specialityApi.getAll(),
        appointmentApi.getAll(),
        prescriptionApi.getAll()
      ]);

      const data = {
        patients: results[0].status === 'fulfilled' ? results[0].value.length : '—',
        doctors: results[1].status === 'fulfilled' ? results[1].value.length : '—',
        departments: results[2].status === 'fulfilled' ? results[2].value.length : '—',
        specialities: results[3].status === 'fulfilled' ? results[3].value.length : '—',
        appointments: results[4].status === 'fulfilled' ? results[4].value.length : '—',
        prescriptions: results[5].status === 'fulfilled' ? results[5].value.length : '—'
      };

      setCounts(data);

      // Extract doctors and departments for staffing summary
      const doctorsList = results[1].status === 'fulfilled' ? results[1].value : [];
      const departmentsList = results[2].status === 'fulfilled' ? results[2].value : [];

      if (departmentsList.length > 0) {
        const staffing = departmentsList.map(dept => ({
          deptId: dept.deptId,
          deptName: dept.deptName,
          deptLocation: dept.deptLocation,
          doctorCount: doctorsList.filter(doc => doc.dept?.deptId === dept.deptId).length
        }));
        setDeptStaffing(staffing);
      } else {
        setDeptStaffing([]);
      }

      // Recent appointments
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) {
        const sorted = [...results[4].value].sort((a, b) => {
          return new Date(b.appointmentDate) - new Date(a.appointmentDate);
        });
        setRecentAppointments(sorted.slice(0, 5));
      } else {
        setRecentAppointments([]);
      }

      // If all failed, trigger error state
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed) {
        setError('Cannot connect to the backend server. Please check if the backend service is running and accessible.');
      }
    } catch (err) {
      setError('Failed to fetch hospital metrics from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loader type="dashboard" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorState 
          title="Backend Integration Error" 
          message={error} 
          onRetry={() => fetchDashboardData(false)} 
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

  const getStatusBadge = (dateStr) => {
    if (!dateStr) return { text: 'Scheduled', class: 'badge-blue' };
    const appDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appDate.setHours(0, 0, 0, 0);

    if (appDate.getTime() === today.getTime()) {
      return { text: 'Today', class: 'badge-emerald' };
    } else if (appDate.getTime() > today.getTime()) {
      return { text: 'Upcoming', class: 'badge-indigo' };
    }
    return { text: 'Completed', class: 'badge-blue' };
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Top Header Section */}
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Hospital Overview</h1>
          <p className="page-subtitle">Real-time statistics and administrative overview of hospital operations.</p>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={refreshing}
          onClick={() => fetchDashboardData(true)}
          title="Refresh analytics data"
        >
          {refreshing ? 'Syncing...' : 'Refresh'}
        </Button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className="stat-card" 
            onClick={() => navigate(card.link)} 
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            role="button"
            aria-label={`View ${card.label}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(card.link);
            }}
          >
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

      {/* Main Dashboard Layout Grid */}
      <div className="dashboard-layout">
        {/* Left Side: Recent Appointments */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Recent Consultations</h3>
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
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
              <p>No recent consultations recorded.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ flex: 1 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Slot ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((app) => {
                    const status = getStatusBadge(app.appointmentDate);
                    return (
                      <tr key={app.appointmentId}>
                        <td style={{ fontWeight: 600 }}>#{app.appointmentId}</td>
                        <td>{app.patient?.patientName || <span style={{ color: 'var(--text-muted)' }}>Unknown</span>}</td>
                        <td>{app.doctor?.doctorName || <span style={{ color: 'var(--text-muted)' }}>Unknown</span>}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{app.appointmentDate}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Department Staffing Overview & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Department Staffing Overview */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Department Staffing</h3>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={ArrowRight} 
                onClick={() => navigate('/departments')}
              >
                Manage
              </Button>
            </div>

            {deptStaffing.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No departments configured yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deptStaffing.slice(0, 4).map((dept) => (
                  <div 
                    key={dept.deptId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{dept.deptName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dept.deptLocation}</div>
                    </div>
                    <span className="badge badge-indigo">
                      {dept.doctorCount} {dept.doctorCount === 1 ? 'Doctor' : 'Doctors'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title">Quick Actions</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Common administrative workflows to manage patients, doctors, and schedulers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Button 
                variant="secondary" 
                icon={Plus} 
                onClick={() => navigate('/patients', { state: { openAddModal: true } })}
                style={{ justifyContent: 'center', padding: '10px 12px', fontSize: '13px' }}
              >
                New Patient
              </Button>
              <Button 
                variant="secondary" 
                icon={Plus} 
                onClick={() => navigate('/doctors', { state: { openAddModal: true } })}
                style={{ justifyContent: 'center', padding: '10px 12px', fontSize: '13px' }}
              >
                New Doctor
              </Button>
              <Button 
                variant="secondary" 
                icon={Plus} 
                onClick={() => navigate('/appointments', { state: { openAddModal: true } })}
                style={{ justifyContent: 'center', padding: '10px 12px', fontSize: '13px' }}
              >
                Book Slot
              </Button>
              <Button 
                variant="secondary" 
                icon={Plus} 
                onClick={() => navigate('/departments', { state: { openAddModal: true } })}
                style={{ justifyContent: 'center', padding: '10px 12px', fontSize: '13px' }}
              >
                Add Dept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
