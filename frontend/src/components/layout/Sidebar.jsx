import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  
  // On mobile screen, always show full labels even if desktop sidebar is collapsed
  const isEffectiveCollapsed = collapsed && !mobileOpen;

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
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const checkIsActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/admin/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} 
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      ></div>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo-container" style={{ justifyContent: 'space-between' }}>
          <NavLink to="/" className="logo-text" onClick={handleLinkClick}>
            <HeartPulse className="logo-icon" size={28} strokeWidth={2.5} />
            {!isEffectiveCollapsed && <span>CareSync</span>}
          </NavLink>
          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <ul className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => {
            const isActive = checkIsActive(item.path);
            return (
              <li key={item.name} className="sidebar-menu-item">
                <NavLink
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                  title={isEffectiveCollapsed ? item.name : undefined}
                >
                  <item.icon className="sidebar-link-icon" size={20} />
                  {!isEffectiveCollapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
          <li className="sidebar-menu-item" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button
              onClick={logout}
              className="sidebar-link"
              title={isEffectiveCollapsed ? "Logout" : undefined}
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
              {!isEffectiveCollapsed && <span>Logout</span>}
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
