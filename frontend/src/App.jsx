import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
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

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
