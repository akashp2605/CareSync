import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Users, ArrowRight } from 'lucide-react';
import caresyncLogo from '../../assets/caresync.png';

const ROLES = [
  {
    id: 'admin',
    roleKey: 'ADMIN',
    badge: 'Operations & Management',
    cardClass: 'role-card-admin',
    title: 'Admin',
    description: 'Manage hospital operations, users and system administration',
    icon: ShieldCheck,
    route: '/login/admin',
    actionText: 'Access Admin Portal'
  },
  {
    id: 'doctor',
    roleKey: 'DOCTOR',
    badge: 'Clinical Care',
    cardClass: 'role-card-doctor',
    title: 'Doctor',
    description: 'Access patient records, appointments and medical information',
    icon: Stethoscope,
    route: '/login/doctor',
    actionText: 'Access Clinical Portal'
  },
  {
    id: 'patient',
    roleKey: 'PATIENT',
    badge: 'Health Records',
    cardClass: 'role-card-patient',
    title: 'Patient',
    description: 'Manage appointments and access personal healthcare information',
    icon: Users,
    route: '/login/patient',
    actionText: 'Access Patient Portal'
  }
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (route) => {
    navigate(route);
  };

  return (
    <div className="role-select-page">
      {/* Background ambient medical glows */}
      <div className="role-select-ambient-1" />
      <div className="role-select-ambient-2" />

      <div className="role-select-container">
        {/* Brand Badge */}
        <div className="role-select-brand">
          <img src={caresyncLogo} alt="CareSync" className="role-select-brand-logo" />
          <span className="role-select-brand-name">CareSync Health</span>
        </div>

        {/* Header */}
        <div className="role-select-header">
          <h1 className="role-select-title">Login as</h1>
          <p className="role-select-subtitle">
            Choose your portal to continue
          </p>
        </div>

        {/* 3-Card Balanced Role Grid */}
        <div className="role-cards-grid" role="group" aria-label="Portal Selection">
          {ROLES.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                className={`role-card ${role.cardClass}`}
                onClick={() => handleRoleSelect(role.route)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleSelect(role.route);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Login as ${role.title} - ${role.description}`}
              >
                {/* Top accent border line on hover */}
                <div className="role-card-accent-bar" />

                {/* Card Icon */}
                <div className="role-card-icon-wrapper">
                  <IconComponent size={26} strokeWidth={2.2} />
                </div>

                {/* Badge */}
                <span className="role-card-badge">{role.badge}</span>

                {/* Role Title */}
                <h2 className="role-card-title">{role.title}</h2>

                {/* Description */}
                <p className="role-card-desc">{role.description}</p>

                {/* Action footer */}
                <div className="role-card-action">
                  <span>{role.actionText}</span>
                  <ArrowRight className="role-card-arrow" size={16} strokeWidth={2.2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
