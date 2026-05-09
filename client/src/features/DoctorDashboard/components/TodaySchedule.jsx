import React from 'react';
import { Clock, User } from 'lucide-react';

const SCHEDULE = [
  { id: 's1', patient: 'Aarav Mehta',  initials: 'AM', color: '#dc2626', age: 34, time: '09:00 AM', duration: '30 min', type: 'Emergency',    status: 'in-progress', priority: 'critical' },
  { id: 's2', patient: 'Sunita Rao',   initials: 'SR', color: '#d97706', age: 52, time: '09:30 AM', duration: '30 min', type: 'Consultation',  status: 'scheduled',   priority: 'high'     },
  { id: 's3', patient: 'Ramesh Gupta', initials: 'RG', color: '#d97706', age: 45, time: '10:00 AM', duration: '30 min', type: 'Consultation',  status: 'scheduled',   priority: 'high'     },
  { id: 's4', patient: 'Kiran Patel',  initials: 'KP', color: '#059669', age: 28, time: '10:30 AM', duration: '30 min', type: 'Consultation',  status: 'scheduled',   priority: 'medium'   },
  { id: 's5', patient: 'Priya Singh',  initials: 'PS', color: '#059669', age: 31, time: '11:00 AM', duration: '30 min', type: 'Follow-up',     status: 'scheduled',   priority: 'medium'   },
  { id: 's6', patient: 'Anjali Desai', initials: 'AD', color: '#0369a1', age: 40, time: '11:30 AM', duration: '30 min', type: 'Check-up',      status: 'scheduled',   priority: 'low'      },
];

/**
 * TodaySchedule – tabular view of today's schedule.
 * Maps to GET /api/appointments/my-appointments filtered to today's date.
 */
export default function TodaySchedule() {
  return (
    <div className="dd-card" id="today-schedule-card">
      <div className="dd-card-header">
        <span className="dd-card-title">Today's Schedule</span>
        <button className="dd-card-action">Add Slot</button>
      </div>

      <div className="dd-table-wrap">
        <table className="dd-table" aria-label="Today's appointment schedule">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Time</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((s) => (
              <tr key={s.id} id={`schedule-row-${s.id}`}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      className="dd-table-avatar"
                      style={{ background: s.color }}
                    >
                      {s.initials}
                    </div>
                    <div>
                      <div className="dd-table-name">{s.patient}</div>
                      <div className="dd-table-sub">
                        <User size={10} style={{ marginRight: 3 }} />
                        {s.age} yrs
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="dd-table-name">{s.time}</div>
                  <div className="dd-table-sub">
                    <Clock size={10} style={{ marginRight: 3 }} />
                    {s.duration}
                  </div>
                </td>
                <td>{s.type}</td>
                <td>
                  <span className={`p-badge ${s.priority}`}>
                    {s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={`dd-status-pill ${s.status}`}>
                    {s.status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </td>
                <td>
                  <button className="dd-action-btn" id={`view-${s.id}`}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
