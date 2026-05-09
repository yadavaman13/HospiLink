import React, { useState } from 'react';
import Sidebar              from '../components/Sidebar';
import Topbar               from '../components/Topbar';
import StatsGrid            from '../components/StatsGrid';
import PatientChart         from '../components/PatientChart';
import AppointmentQueue     from '../components/AppointmentQueue';
import AppointmentRequests  from '../components/AppointmentRequests';
import TodaySchedule        from '../components/TodaySchedule';
import '../styles/dashboard.css';

/* Mock doctor profile – replace with real API call to GET /api/auth/me */
const MOCK_DOCTOR = {
  firstName:      'Arjun',
  lastName:       'Mehta',
  specialization: 'Cardiologist',
  hospitalId:     'HOSP_001',
};

/**
 * DoctorDashboard – main page
 *
 * Folder: features/DoctorDashboard/
 * Route:  /doctor/dashboard
 *
 * Reflects all backend features:
 *  - AI appointment queue   (GET /api/appointments/my-appointments)
 *  - Appointment requests   (accept/reject)
 *  - Today's schedule       (GET /api/doctors/:id/schedule)
 *  - Break management       (POST /api/doctors/break/start | end)
 *  - Patient chart          (patient distribution overview)
 */
export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="dd-shell">
      {/* ── Sidebar ── */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main ── */}
      <main className="dd-main">
        <Topbar doctor={MOCK_DOCTOR} />

        <div className="dd-content">
          {/* Row 1: Stats (2×3 grid) + Appointment Calendar side by side */}
          <div className="dd-row-stats-chart">
            <StatsGrid />
            <PatientChart />
          </div>

          {/* Row 2: Appointment requests full width */}
          <div className="dd-row">
            <AppointmentRequests />
            <div /> {/* spacer */}
          </div>

          {/* Row 3: AI queue + Appointment requests (wide layout) */}
          <div className="dd-row">
            <AppointmentQueue />
            {/* Right column intentionally empty on this row for breathing room */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quick info card */}
              <div className="dd-card" id="quick-info-card">
                <div className="dd-card-header">
                  <span className="dd-card-title">Consultation Fee</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹500
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Per session · 30 min slots
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />
                <div className="dd-card-header" style={{ marginBottom: 10 }}>
                  <span className="dd-card-title" style={{ fontSize: '0.9rem' }}>Experience</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>8 yrs</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Cardiology Specialist
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />
                <div className="dd-card-header" style={{ marginBottom: 10 }}>
                  <span className="dd-card-title" style={{ fontSize: '0.9rem' }}>Today's Hours</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                  09:00 AM – 06:00 PM
                </div>
                <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Available for 12 more slots
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Full-width schedule table */}
          <TodaySchedule />
        </div>
      </main>
    </div>
  );
}
