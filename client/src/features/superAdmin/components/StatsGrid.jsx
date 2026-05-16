import React from 'react';
import { Building2, Users, Stethoscope, CalendarClock, BadgeCheck, AlertTriangle } from 'lucide-react';

export default function StatsGrid({ totals }) {
  const t = totals || {};
  const items = [
    { label: 'Hospitals', value: t.hospitals ?? '-', icon: Building2, tone: 'primary', hint: 'Registered network' },
    { label: 'Patients', value: t.patients ?? '-', icon: Users, tone: 'mint', hint: 'Platform-wide base' },
    { label: 'Doctors', value: t.doctors ?? '-', icon: Stethoscope, tone: 'slate', hint: 'Active practitioners' },
    { label: 'Appointments', value: t.appointments ?? '-', icon: CalendarClock, tone: 'amber', hint: 'All-time bookings' }
  ];

  return (
    <div className="dd-stats-grid super-stats-grid">
      {items.map(i => (
        <div key={i.label} className="dd-stat-card super-stat-card">
          {(() => {
            const Icon = i.icon;
            return (
          <div className={`dd-stat-icon super-stat-icon tone-${i.tone}`}>
                <Icon size={20} />
          </div>
            );
          })()}
          <div className="dd-stat-body">
            <div className="dd-stat-label">{i.label}</div>
            <div className="dd-stat-value">{i.value}</div>
            <div className="super-stat-hint">{i.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
