import React from 'react';
import { LayoutDashboard, Hospital, CheckCircle2, BarChart3, Settings, LogOut, Shield, CircleAlert } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="dd-sidebar super-sidebar">
      <a className="dd-sidebar-logo super-sidebar-logo" href="#" aria-label="HospiLink super admin home">
        <div>
          <div className="dd-sidebar-logo-text super-sidebar-title">HospiLink</div>
        </div>
      </a>

      <nav className="dd-nav" aria-label="Super admin navigation">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`dd-nav-item super-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <span className="super-nav-icon"><Icon size={16} /></span>
            <span>{label}</span>
          </button>
        ))}

        <div className="super-nav-separator" />
        <button className="dd-nav-item nav-danger super-nav-item" onClick={() => onTabChange('rejected')}>
          <span className="super-nav-icon danger"><CircleAlert size={16} /></span>
          <span>Rejected</span>
        </button>
      </nav>

      <div className="dd-sidebar-footer super-sidebar-footer">
        <button id="nav-logout" className="super-logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
