import React, { useState } from 'react';
import {
  Activity,
  LayoutDashboard,
  CalendarCheck,
  Users,
  ClipboardList,
  BedDouble,
  QrCode,
  Settings,
  LogOut,
  Coffee,
  XCircle,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',          id: 'dashboard',    badge: null },
  { icon: CalendarCheck,   label: 'Appointments',       id: 'appointments', badge: 8    },
  { icon: Users,           label: 'My Patients',        id: 'patients',     badge: null },
  { icon: ClipboardList,   label: 'Medical Records',    id: 'records',      badge: null },
  { icon: BedDouble,       label: 'Bed Status',         id: 'beds',         badge: null },
  { icon: QrCode,          label: 'Scan QR Code',       id: 'qr',           badge: null },
];

const BREAK_REASONS = ['lunch', 'meeting', 'emergency', 'other'];

/**
 * Sidebar component – navigation + break management
 */
export default function Sidebar({ activeTab, onTabChange }) {
  const [breakActive, setBreakActive] = useState(false);
  const [breakReason, setBreakReason] = useState('lunch');
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  const handleBreakToggle = () => {
    if (breakActive) {
      setBreakActive(false);
    } else {
      setShowReasonPicker(true);
    }
  };

  const confirmBreak = (reason) => {
    setBreakReason(reason);
    setBreakActive(true);
    setShowReasonPicker(false);
  };

  return (
    <aside className="dd-sidebar">
      {/* Logo */}
      <a href="/" className="dd-sidebar-logo">
        <div className="dd-sidebar-logo-icon">
          <Activity size={18} strokeWidth={2.5} color="#fff" />
        </div>
        <span className="dd-sidebar-logo-text">Hospi<span>Link</span></span>
      </a>

      {/* Navigation */}
      <nav className="dd-nav" aria-label="Doctor navigation">
        <span className="dd-nav-section-label">Main</span>

        {NAV_ITEMS.map(({ icon: Icon, label, id, badge }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`dd-nav-item${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon size={17} strokeWidth={1.9} />
            {label}
            {badge !== null && <span className="nav-badge">{badge}</span>}
          </button>
        ))}

        <span className="dd-nav-section-label">Account</span>
        <button className="dd-nav-item" id="nav-settings" onClick={() => onTabChange('settings')}>
          <Settings size={17} strokeWidth={1.9} />
          Settings
        </button>
        <button className="dd-nav-item nav-danger" id="nav-logout">
          <LogOut size={17} strokeWidth={1.9} />
          Sign Out
        </button>
      </nav>

      {/* Break management (maps to startDoctorBreak / endDoctorBreak API) */}
      <div className="dd-sidebar-footer">
        <div className="dd-break-card">
          <div className="dd-break-card-title">
            <Coffee size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Break Status
          </div>

          {showReasonPicker ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {BREAK_REASONS.map((r) => (
                <button key={r} className="dd-break-btn start" style={{ fontSize: '0.74rem', padding: '6px' }}
                  onClick={() => confirmBreak(r)}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
              <button className="dd-break-btn" style={{ background: 'var(--border)', color: 'var(--text-mid)' }}
                onClick={() => setShowReasonPicker(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button className={`dd-break-btn ${breakActive ? 'end' : 'start'}`}
                onClick={handleBreakToggle} id="break-toggle-btn">
                {breakActive
                  ? <><XCircle size={14} /> End Break</>
                  : <><Coffee size={14} /> Start Break</>}
              </button>
              <p className="dd-break-status">
                {breakActive
                  ? <><strong>On break</strong> · {breakReason}</>
                  : 'You are currently active'}
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
