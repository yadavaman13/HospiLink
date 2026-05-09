import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarDays, Dot } from 'lucide-react';

/* ─── Day-wise appointment count data (mock – replace with API) ─── */
const APPOINTMENT_COUNTS = {
  '2026-05-01': 6,
  '2026-05-02': 4,
  '2026-05-05': 9,
  '2026-05-06': 3,
  '2026-05-07': 11,
  '2026-05-08': 7,
  '2026-05-09': 8,
  '2026-05-12': 5,
  '2026-05-13': 12,
  '2026-05-14': 10,
  '2026-05-15': 6,
  '2026-05-16': 2,
  '2026-05-19': 9,
  '2026-05-20': 14,
  '2026-05-21': 8,
  '2026-05-22': 5,
  '2026-05-23': 3,
  '2026-05-26': 11,
  '2026-05-27': 7,
  '2026-05-28': 4,
};

/* Format date to YYYY-MM-DD key */
const toKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/* Colour tier based on count */
const getTier = (count) => {
  if (!count) return null;
  if (count >= 12) return 'high';
  if (count >= 7)  return 'med';
  return 'low';
};

/**
 * PatientChart – react-calendar with day-wise appointment count overlay.
 * Tile content shows a colour-coded dot + count for any day with appointments.
 * Clicking a date shows a mini summary below.
 */
export default function PatientChart() {
  const [selected, setSelected] = useState(new Date());

  const selectedKey   = toKey(selected);
  const selectedCount = APPOINTMENT_COUNTS[selectedKey] ?? 0;

  /* Custom tile content */
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key   = toKey(date);
    const count = APPOINTMENT_COUNTS[key];
    if (!count) return null;
    const tier  = getTier(count);
    return (
      <div className="cal-tile-content">
        <span className={`cal-dot cal-dot-${tier}`} />
        <span className={`cal-count cal-count-${tier}`}>{count}</span>
      </div>
    );
  };

  /* Disable weekends (Saturday=6, Sunday=0) */
  const tileDisabled = ({ date }) => date.getDay() === 0 || date.getDay() === 6;

  /* Custom class names */
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const key   = toKey(date);
    const count = APPOINTMENT_COUNTS[key];
    const tier  = getTier(count);
    if (tier === 'high') return 'cal-tile-high';
    if (tier === 'med')  return 'cal-tile-med';
    if (tier === 'low')  return 'cal-tile-low';
    return '';
  };

  return (
    <div className="dd-card" id="patient-chart-card">
      <div className="dd-card-header">
        <span className="dd-card-title">
          <CalendarDays size={16} style={{ marginRight: 7, color: 'var(--primary)' }} />
          Appointment Calendar
        </span>
        <button className="dd-card-action">This Month ▾</button>
      </div>

      {/* react-calendar */}
      <div className="cal-wrapper">
        <Calendar
          onChange={setSelected}
          value={selected}
          tileContent={tileContent}
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
          locale="en-IN"
          minDetail="month"
          showNeighboringMonth={false}
        />
      </div>

      {/* Selected day summary */}
      <div className="cal-selected-summary">
        <div className="cal-summary-date">
          {selected.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {selectedCount > 0 ? (
          <div className="cal-summary-count">
            <span className={`cal-dot cal-dot-${getTier(selectedCount)}`} style={{ width: 10, height: 10 }} />
            <strong>{selectedCount} appointments</strong> scheduled
          </div>
        ) : (
          <div className="cal-summary-count" style={{ color: 'var(--text-muted)' }}>
            No appointments scheduled
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <div className="cal-legend-item">
          <span className="cal-dot cal-dot-low" />
          <span>1–6 appts</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-dot cal-dot-med" />
          <span>7–11 appts</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-dot cal-dot-high" />
          <span>12+ appts</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-dot" style={{ background: 'var(--border)' }} />
          <span>Weekend / Off</span>
        </div>
      </div>
    </div>
  );
}
