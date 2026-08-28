import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  CalendarRange,
  FileSpreadsheet,
  Award,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { logout, user } = useAuth();
  
  const getMenuItems = () => {
    if (!user) return [];
    if (user.role === 'DOCTOR') {
      return [
        { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard }
      ];
    }
    if (user.role === 'PATIENT') {
      return [
        { name: 'Patient Dashboard', path: '/patient/dashboard', icon: LayoutDashboard }
      ];
    }
    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Patients', path: '/patients', icon: Users },
      { name: 'Doctors', path: '/doctors', icon: Stethoscope },
      { name: 'Departments', path: '/departments', icon: Building2 },
      { name: 'Specialities', path: '/specialities', icon: Award },
      { name: 'Appointments', path: '/appointments', icon: CalendarRange },
      { name: 'Prescriptions', path: '/prescriptions', icon: FileSpreadsheet }
    ];
  };

  const menuItems = getMenuItems();

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} 
        onClick={() => setMobileOpen(false)}
      ></div>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo-container">
          <NavLink to="/" className="logo-text" onClick={handleLinkClick}>
            <HeartPulse className="logo-icon" size={28} strokeWidth={2.5} />
            {!collapsed && <span>CareSync</span>}
          </NavLink>
        </div>

        <ul className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <li key={item.name} className="sidebar-menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                end={item.path.endsWith('dashboard')}
              >
                <item.icon className="sidebar-link-icon" size={20} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
          <li className="sidebar-menu-item" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button
              onClick={logout}
              className="sidebar-link"
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '12px 16px'
              }}
            >
              <LogOut className="sidebar-link-icon" size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>

        {/* Desktop Collapse Toggle Button */}
        <div className="sidebar-footer">
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="collapse-btn"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
