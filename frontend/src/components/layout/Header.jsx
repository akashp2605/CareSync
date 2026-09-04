import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getDisplayName = () => {
    if (!user) return '';
    if (user.role === 'ADMIN') return 'Admin Portal';
    if (user.role === 'DOCTOR') return user.doctorName;
    if (user.role === 'PATIENT') return user.patientName;
    return '';
  };

  const getDisplayRole = () => {
    if (!user) return '';
    if (user.role === 'ADMIN') return 'System Administrator';
    if (user.role === 'DOCTOR') return 'Medical Doctor';
    if (user.role === 'PATIENT') return 'Patient';
    return '';
  };

  const getInitials = () => {
    if (!user) return '';
    if (user.role === 'ADMIN') return 'AD';
    const name = user.role === 'DOCTOR' ? user.doctorName : user.patientName;
    if (!name) return '';
    let cleanName = name;
    if (name.toLowerCase().startsWith('dr. ')) {
      cleanName = name.substring(4);
    }
    const parts = cleanName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '';
  };

  const pathnames = location.pathname.split('/').filter((x) => x);

  // Format today's date: "Thursday, Aug 27, 2026"
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Map path slugs to user-friendly titles
  const routeNameMap = {
    dashboard: 'Dashboard',
    admin: 'Admin',
    doctor: 'Doctor',
    patient: 'Patient',
    patients: 'Patients',
    doctors: 'Doctors',
    departments: 'Departments',
    specialities: 'Specialities',
    appointments: 'Appointments',
    prescriptions: 'Prescriptions',
    add: 'New',
    edit: 'Edit'
  };

  const homeRoute = user?.role === 'DOCTOR'
    ? '/doctor/dashboard'
    : user?.role === 'PATIENT'
    ? '/patient/dashboard'
    : '/dashboard';

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileOpen(true)}
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="breadcrumb-container" aria-label="Breadcrumb">
          <div className="breadcrumb-item">
            <Link to={homeRoute} className="breadcrumb-link">Home</Link>
          </div>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const displayTitle = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return (
              <div key={to} className="breadcrumb-item">
                <ChevronRight size={14} className="breadcrumb-separator" />
                {last ? (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{displayTitle}</span>
                ) : (
                  <Link to={to} className="breadcrumb-link">{displayTitle}</Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="header-right">
        {/* Date Display */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {getFormattedDate()}
        </div>

        {/* User profile */}
        <div className="user-profile">
          <div className="user-avatar">{getInitials()}</div>
          <div className="user-info">
            <span className="user-name">{getDisplayName()}</span>
            <span className="user-role">{getDisplayRole()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
