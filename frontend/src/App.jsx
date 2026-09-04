import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './components/common/SplashScreen';
import RoleSelection from './pages/Login/RoleSelection';
import Login from './pages/Login/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Patients from './pages/Patients/Patients';
import Doctors from './pages/Doctors/Doctors';
import Departments from './pages/Departments/Departments';
import Specialities from './pages/Specialities/Specialities';
import Appointments from './pages/Appointments/Appointments';
import Prescriptions from './pages/Prescriptions/Prescriptions';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSplashFinish = () => {
    setShowSplash(false);
    // When initially opened or refreshed on public/login paths, redirect to role selection
    if (location.pathname === '/' || location.pathname.startsWith('/login')) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthProvider>
      {/* Splash screen displayed on initial open / page refresh */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <Routes>
        {/* Public Routes: Role selection and dedicated role login */}
        <Route path="/login" element={<RoleSelection />} />
        <Route path="/login/:role" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/specialities" element={<Specialities />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
          </Route>
        </Route>

        {/* Doctor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route element={<MainLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          </Route>
        </Route>

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route element={<MainLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
          </Route>
        </Route>

        {/* Default redirect to login role selection */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
