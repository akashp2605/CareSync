import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import { Stethoscope, Users, ShieldAlert, HeartPulse } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('ADMIN'); // ADMIN, DOCTOR, PATIENT

  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Doctor/Patient inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    setNameInput('');
    setPhoneInput('');
    setAdminUsername('');
    setAdminPassword('');
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <HeartPulse size={36} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>CareSync Portal</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Hospital Management & Medical Records System
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--secondary-light)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          {[
            { id: 'ADMIN', label: 'Admin', icon: ShieldAlert },
            { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
            { id: 'PATIENT', label: 'Patient', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRoleChange(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 0',
                border: 'none',
                background: role === tab.id ? '#ffffff' : 'transparent',
                color: role === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: role === tab.id ? 600 : 500,
                cursor: 'pointer',
                boxShadow: role === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
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

        {/* Form */}
        <form onSubmit={handleLoginSubmit} noValidate>
          {role === 'ADMIN' ? (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
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
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                />
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
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
          >
            Access Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
