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
    <aside className="hl-sidebar">
      {/* Logo */}
      <div className="hl-logo">
        <span>HospiLink</span>
      </div>

      {/* Navigation */}
      <nav className="hl-nav" aria-label="Doctor navigation">
        {NAV_ITEMS.map(({ icon: Icon, label, id, badge }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={activeTab === id ? 'active' : ''}
            onClick={() => onTabChange(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}

        <button className={activeTab === 'settings' ? 'active' : ''} id="nav-settings" onClick={() => onTabChange('settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button id="nav-logout">
          <LogOut size={20} />
          <span>Sign Out</span>
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
