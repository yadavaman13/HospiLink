import React, { useState } from 'react';
import { Brain, Clock, Stethoscope } from 'lucide-react';

/* Mock AI-sorted queue (sorted by priorityScore desc – matches backend) */
const QUEUE = [
  { id: 'q1', name: 'Aarav Mehta',  initials: 'AM', color: '#dc2626', priority: 'critical', score: 91, symptoms: 'Chest pain, shortness of breath',  time: '09:00 AM', type: 'Emergency' },
  { id: 'q2', name: 'Sunita Rao',   initials: 'SR', color: '#d97706', priority: 'high',     score: 74, symptoms: 'High fever, severe headache',       time: '09:30 AM', type: 'Consultation' },
  { id: 'q3', name: 'Ramesh Gupta', initials: 'RG', color: '#d97706', priority: 'high',     score: 68, symptoms: 'Severe abdominal pain',             time: '10:00 AM', type: 'Consultation' },
  { id: 'q4', name: 'Kiran Patel',  initials: 'KP', color: '#059669', priority: 'medium',   score: 45, symptoms: 'Mild cough, fatigue, runny nose',   time: '10:30 AM', type: 'Consultation' },
  { id: 'q5', name: 'Priya Singh',  initials: 'PS', color: '#059669', priority: 'medium',   score: 40, symptoms: 'Back pain, mild fever',             time: '11:00 AM', type: 'Follow-up'   },
  { id: 'q6', name: 'Anjali Desai', initials: 'AD', color: '#0369a1', priority: 'low',      score: 22, symptoms: 'Routine check-up, no complaints',   time: '11:30 AM', type: 'Check-up'    },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildDateStrip() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { day: DAYS[d.getDay()], date: d.getDate(), full: d.toISOString() };
  });
}

/**
 * AppointmentQueue – AI-sorted patient queue (critical → low priority)
 * Reflects GET /api/appointments/my-appointments filtered to today, sorted by AI score
 */
export default function AppointmentQueue() {
  const dates = buildDateStrip();
  const [selectedDate, setSelectedDate] = useState(0);

  return (
    <div className="dd-card" id="appointment-queue-card">
      <div className="dd-card-header">
        <span className="dd-card-title">
          <Brain size={16} style={{ marginRight: 7, color: 'var(--primary)' }} />
          AI Appointment Queue
        </span>
        <button className="dd-card-action">See All</button>
      </div>

      {/* Date strip */}
      <div className="dd-date-strip" style={{ marginBottom: 18 }}>
        {dates.map((d, i) => (
          <div
            key={d.full}
            id={`date-chip-${i}`}
            className={`dd-date-chip${selectedDate === i ? ' active' : ''}`}
            onClick={() => setSelectedDate(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedDate(i)}
          >
            <span className="day">{d.day}</span>
            <span className="date">{d.date}</span>
            {i < 3 && <div className="dd-date-dot" />}
          </div>
        ))}
      </div>

      {/* Queue list */}
      <div className="dd-queue">
        {QUEUE.map((p, i) => (
          <div className="dd-queue-item" key={p.id} id={`queue-item-${p.id}`}>
            <div className="dd-queue-rank">{i + 1}</div>
            <div className="dd-queue-avatar" style={{ background: p.color }}>{p.initials}</div>
            <div className="dd-queue-info">
              <div className="dd-queue-name">{p.name}</div>
              <div className="dd-queue-meta">
                <Stethoscope size={11} style={{ marginRight: 4 }} />
                {p.symptoms}
              </div>
            </div>
            <div className="dd-queue-right">
              <span className={`p-badge ${p.priority}`}>
                {p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}
              </span>
              <span className="dd-queue-time">
                <Clock size={11} style={{ marginRight: 3 }} />
                {p.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
