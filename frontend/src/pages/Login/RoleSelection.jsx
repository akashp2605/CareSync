import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Users, ChevronRight, CornerRightDown } from 'lucide-react';
import caresyncLogo from '../../assets/caresync.png';

const ROLES = [
  {
    id: 'admin',
    roleKey: 'ADMIN',
    title: 'Continue as Admin',
    description: 'Manage hospital operations and users',
    icon: ShieldCheck,
    route: '/login/admin',
    btnClass: 'ref-btn-doctor',
    iconColor: '#0d9488'
  },
  {
    id: 'doctor',
    roleKey: 'DOCTOR',
    title: 'Continue as Doctor',
    description: 'Access patients and manage medical information',
    icon: Stethoscope,
    route: '/login/doctor',
    btnClass: 'ref-btn-doctor',
    iconColor: '#0d9488'
  },
  {
    id: 'patient',
    roleKey: 'PATIENT',
    title: 'Continue as Patient',
    description: 'Manage appointments and personal health information',
    icon: Users,
    route: '/login/patient',
    btnClass: 'ref-btn-doctor',
    iconColor: '#0d9488'
  }
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (route) => {
    navigate(route);
  };

  return (
    <div className="ref-role-page-wrapper">
      {/* Ambient background glows */}
      <div className="ref-role-bg-circle-1" />
      <div className="ref-role-bg-circle-2" />

      <div className="ref-role-container">
        {/* Left Column: Clean Brand & Heading */}
        <div className="ref-role-left">
          <div className="ref-role-logo-badge">
            <img src={caresyncLogo} alt="CareSync" className="ref-role-logo-img" />
            <span className="ref-role-logo-name">CareSync</span>
          </div>

          <h1 className="ref-role-title">Login as</h1>

          <p className="ref-role-description">
            Select your role to continue.
          </p>
        </div>

        {/* Right Column: Rounded Card Box with Stacked Buttons (Reference Style) */}
        <div className="ref-role-right">
          <div className="ref-role-card-box">
            {/* Playful curved annotation */}
            <div className="ref-role-annotation">
              <CornerRightDown className="ref-role-annotation-arrow" size={18} strokeWidth={2} />
              <span>Select your role</span>
            </div>

            {/* Stacked 3 Buttons: Blue (Admin), White (Doctor), Black (Patient) */}
            <div className="ref-buttons-stack" role="group" aria-label="Choose Login Role">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`ref-btn ${role.btnClass}`}
                    onClick={() => handleRoleSelect(role.route)}
                    aria-label={`${role.title} - ${role.description}`}
                  >
                    <div className="ref-btn-left-content">
                      <div className="ref-btn-icon-wrapper">
                        <IconComponent size={22} color={role.iconColor} strokeWidth={2.4} />
                      </div>
                      <div className="ref-btn-texts">
                        <span className="ref-btn-title">{role.title}</span>
                        <span className="ref-btn-desc">{role.description}</span>
                      </div>
                    </div>

                    <ChevronRight className="ref-btn-arrow" size={18} strokeWidth={2.4} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
