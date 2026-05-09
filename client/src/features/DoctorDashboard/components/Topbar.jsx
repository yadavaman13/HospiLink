import React from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';

/**
 * Topbar – sticky header with search, notifications, and doctor profile chip
 */
export default function Topbar({ doctor }) {
  const initials = doctor
    ? `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`
    : 'DR';

  return (
    <header className="dd-topbar">
      <div>
        <div className="dd-topbar-title">Doctor Dashboard</div>
        <div className="dd-topbar-sub">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="dd-topbar-spacer" />

      {/* Search */}
      <div className="dd-search-wrap">
        <Search size={15} color="var(--text-muted)" strokeWidth={2} />
        <input
          id="dashboard-search"
          className="dd-search-input"
          placeholder="Search patients, appointments…"
          aria-label="Search"
        />
      </div>

      <div className="dd-topbar-actions">
        {/* Notifications */}
        <button className="dd-icon-btn" id="notif-btn" aria-label="Notifications">
          <Bell size={17} strokeWidth={2} color="var(--text-mid)" />
          <span className="dd-notif-dot" />
        </button>

        {/* Doctor chip */}
        <div className="dd-doctor-chip" id="doctor-profile-chip">
          <div className="dd-doctor-avatar">{initials}</div>
          <div className="dd-doctor-info">
            <span className="dd-doctor-name">
              Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Loading…'}
            </span>
            <span className="dd-doctor-spec">
              {doctor?.specialization ?? 'Specialist'}
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
