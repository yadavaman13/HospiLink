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
    <header className="hl-header">
      <div className="hl-breadcrumb">Doctor Dashboard</div>
      <div className="hl-header-actions">
        <div className="header-user">
          <div className="header-user-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="name">Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Loading…'}</span>
            <span className="role">{doctor?.specialization ?? 'Specialist'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
