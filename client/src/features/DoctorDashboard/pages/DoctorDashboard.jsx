import React, { useState } from 'react';
import Sidebar              from '../components/Sidebar';
import Topbar               from '../components/Topbar';
import StatsGrid            from '../components/StatsGrid';
import PatientChart         from '../components/PatientChart';
import AppointmentQueue     from '../components/AppointmentQueue';
import AppointmentRequests  from '../components/AppointmentRequests';
import TodaySchedule        from '../components/TodaySchedule';
import '../styles/dashboard.css';
import '../../PatientDashboard/styles/patient-dashboard.css';

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
    <div className="hl-dashboard">
      <div className="hl-app-wrapper">
        {/* ── Sidebar ── */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Main ── */}
        <main className="hl-main">
          <Topbar doctor={MOCK_DOCTOR} />

          <div className="hl-content-main">
            {activeTab === 'dashboard' && (
              <div className="dd-row-stats-chart">
                <StatsGrid />
                <PatientChart />
              </div>
            )}

            {activeTab === 'appointments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <AppointmentRequests />
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
                <TodaySchedule />
              </div>
            )}

            {activeTab !== 'dashboard' && activeTab !== 'appointments' && (
              <div className="dd-empty" style={{ marginTop: '100px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-dark)' }}>Coming Soon</h3>
                <p style={{ margin: 0 }}>This section is currently under development.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
