import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage }    from './features/LandingPage/pages/LandingPage';
import LoginPage          from './features/auth/pages/LoginPage';
import RegisterPage       from './features/auth/pages/RegisterPage';
import DoctorDashboard    from './features/DoctorDashboard/pages/DoctorDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
        <Route path="/doctor/dashboard"  element={<DoctorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
