import React from 'react';

export default function Topbar({ admin }) {
  const initials = admin ? `${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}` : 'SA';
  return (
    <header className="dd-topbar">
      <div className="dd-topbar-title">Super Admin Dashboard</div>
      <div className="dd-topbar-spacer" />
      <div className="dd-topbar-actions">
        <div className="dd-doctor-chip">
          <div className="dd-doctor-avatar">{initials}</div>
          <div className="dd-doctor-info">
            <div className="dd-doctor-name">{admin ? `${admin.firstName} ${admin.lastName}` : 'Super Admin'}</div>
            <div className="dd-doctor-spec">Platform Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
