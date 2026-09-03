import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import { Stethoscope, Users, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import caresyncLogo from '../../assets/caresync.png';

const ROLE_INFO = {
  ADMIN: {
    title: 'Admin Login',
    badgeText: 'Operations & Administration',
    badgeClass: 'login-role-badge-doctor',
    icon: ShieldCheck,
    desc: 'Manage hospital operations, departments, and users',
    btnColor: '#0d9488'
  },
  DOCTOR: {
    title: 'Doctor Login',
    badgeText: 'Clinical & Patient Care',
    badgeClass: 'login-role-badge-doctor',
    icon: Stethoscope,
    desc: 'Access patients, manage prescriptions, and medical records',
    btnColor: '#0d9488'
  },
  PATIENT: {
    title: 'Patient Login',
    badgeText: 'Personal Health Records',
    badgeClass: 'login-role-badge-doctor',
    icon: Users,
    desc: 'Manage your appointments and personal health information',
    btnColor: '#0d9488'
  }
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role: roleParam } = useParams();

  // Normalize role from URL param (e.g. /login/admin -> ADMIN)
  const getInitialRole = () => {
    if (roleParam) {
      const upper = roleParam.toUpperCase();
      if (upper === 'ADMIN' || upper === 'DOCTOR' || upper === 'PATIENT') {
        return upper;
      }
    }
    return 'ADMIN';
  };

  const [role, setRole] = useState(getInitialRole);

  // Sync role if URL param changes
  useEffect(() => {
    if (roleParam) {
      const upper = roleParam.toUpperCase();
      if (upper === 'ADMIN' || upper === 'DOCTOR' || upper === 'PATIENT') {
        setRole(upper);
        setErrorMsg('');
      }
    }
  }, [roleParam]);

  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Doctor/Patient inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (role === 'ADMIN') {
        if (!adminUsername.trim() || !adminPassword.trim()) {
          setErrorMsg('Username and password are required.');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/admin/login', {
          username: adminUsername.trim(),
          password: adminPassword
        });

        login('ADMIN', response.data);
        navigate('/dashboard');
      }
      else if (role === 'DOCTOR') {
        if (!nameInput.trim() || !phoneInput.trim()) {
          setErrorMsg('Doctor name and mobile number are required.');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/doctor/login', {
          doctorName: nameInput.trim(),
          phone: phoneInput.trim()
        });

        login('DOCTOR', response.data);
        navigate('/doctor/dashboard');
      }
      else if (role === 'PATIENT') {
        if (!nameInput.trim() || !phoneInput.trim()) {
          setErrorMsg('Patient name and mobile number are required.');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/patient/login', {
          patientName: nameInput.trim(),
          phone: phoneInput.trim()
        });

        login('PATIENT', response.data);
        navigate('/patient/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg(err.customMessage || 'Authentication server connection error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRoleInfo = ROLE_INFO[role] || ROLE_INFO.ADMIN;
  const ActiveRoleIcon = activeRoleInfo.icon;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient medical glows */}
      <div className="ref-role-bg-circle-1" />
      <div className="ref-role-bg-circle-2" />

      <div className="card" style={{
        maxWidth: '470px',
        width: '100%',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        {/* Navigation back to role selection */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="login-header-back-btn"
          aria-label="Change role"
        >
          <ArrowLeft size={16} />
          <span>Change role</span>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(252, 251, 251, 1)',
            marginBottom: '14px',
            padding: '8px'
          }}>
            <img
              src={caresyncLogo}
              alt="CareSync"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div>
            <div className={`login-role-badge-container ${activeRoleInfo.badgeClass}`}>
              <ActiveRoleIcon size={14} />
              <span>{activeRoleInfo.badgeText}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            {activeRoleInfo.title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '360px', marginInline: 'auto' }}>
            {activeRoleInfo.desc}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger-text)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
            border: '1px solid var(--danger)'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Dedicated Role Form - No confusing tab switcher */}
        <form onSubmit={handleLoginSubmit} noValidate>
          {role === 'ADMIN' ? (
            <>
              <div className="form-group">
                <label className="form-label">Admin Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Admin Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  {role === 'DOCTOR' ? 'Doctor Full Name' : 'Patient Full Name'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={role === 'DOCTOR' ? "e.g. Dr. Ravi Kumar" : "e.g. Akash Kumar"}
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Registered Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder={role === 'DOCTOR' ? "e.g. 9876543211" : "e.g. 9876543210"}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 600,
              backgroundColor: activeRoleInfo.btnColor,
              borderColor: activeRoleInfo.btnColor,
              borderRadius: '12px'
            }}
          >
            {role === 'ADMIN' ? 'Sign in as Admin' : role === 'DOCTOR' ? 'Sign in as Doctor' : 'Sign in as Patient'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
