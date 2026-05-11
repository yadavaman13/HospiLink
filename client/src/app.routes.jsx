import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage }    from './features/LandingPage/pages/LandingPage';
import LoginPage          from './features/auth/pages/LoginPage';
import RegisterPage       from './features/auth/pages/RegisterPage';
import DoctorDashboard    from './features/DoctorDashboard/pages/DoctorDashboard';
import PatientDashboard   from './features/PatientDashboard/pages/PatientDashboard';
import AppointmentBookingPage from './features/AppointmentBooking/pages/BookingPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                     element={<LandingPage />} />
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/register"             element={<RegisterPage />} />
        <Route path="/doctor/dashboard"     element={<DoctorDashboard />} />
        <Route path="/patient/dashboard"    element={<PatientDashboard />} />
        <Route path="/booking"              element={<AppointmentBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
