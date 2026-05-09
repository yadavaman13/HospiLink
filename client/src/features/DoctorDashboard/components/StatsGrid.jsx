import React from 'react';
import {
  CalendarCheck,
  BookOpen,
  UserPlus,
  CalendarX,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

/* ─── 6 stat cards matching the inspiration layout ─────── */
const STATS = [
  {
    id: 'total-appointments',
    label: 'Total Appointments',
    value: '2.9K',
    sub: 'Last year',
    change: '+5.6%',
    trend: 'up',
    Icon: CalendarCheck,
    iconBg: '#E8F4F6',
    iconColor: 'var(--primary)',
  },
  {
    id: 'overall-booking',
    label: 'Overall Bookings',
    value: '3.2K',
    sub: 'Last year',
    change: '-0.2%',
    trend: 'down',
    Icon: BookOpen,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'new-appointments',
    label: 'New Appointments',
    value: '254',
    sub: 'Last year',
    change: '-4.0%',
    trend: 'down',
    Icon: UserPlus,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    id: 'cancelled-appointments',
    label: 'Cancelled',
    value: '31',
    sub: 'Last year',
    change: '+2.1%',
    trend: 'up',
    Icon: CalendarX,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'total-patients',
    label: 'Total Patients',
    value: '144.7K',
    sub: 'Last month',
    change: '+7.5%',
    trend: 'up',
    Icon: Users,
    iconBg: '#d1fae5',
    iconColor: '#059669',
  },
  {
    id: 'appointments-today',
    label: 'Appointments Today',
    value: '08',
    sub: 'Last day',
    change: '+0.01%',
    trend: 'up',
    Icon: Clock,
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
  },
];

const TREND_ICON = {
  up:      <TrendingUp  size={11} strokeWidth={2.5} />,
  down:    <TrendingDown size={11} strokeWidth={2.5} />,
  neutral: <Minus        size={11} strokeWidth={2.5} />,
};

/**
 * StatsGrid – 6 KPI cards in a 2-column × 3-row grid
 * (mirrors the inspiration image layout)
 */
export default function StatsGrid() {
  return (
    <div className="dd-stats-grid dd-stats-grid-6">
      {STATS.map(({ id, label, value, sub, change, trend, Icon, iconBg, iconColor }) => (
        <div className="dd-stat-card" key={id} id={`stat-${id}`}>
          <div className="dd-stat-icon" style={{ background: iconBg }}>
            <Icon size={22} strokeWidth={1.9} color={iconColor} />
          </div>
          <div className="dd-stat-body">
            <div className="dd-stat-label">{label}</div>
            <div className="dd-stat-value">{value}</div>
            <div className={`dd-stat-sub ${trend}`}>
              {TREND_ICON[trend]}
              <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>
                {sub}
              </span>
              <span style={{ marginLeft: 6, fontWeight: 700 }}>
                {change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
