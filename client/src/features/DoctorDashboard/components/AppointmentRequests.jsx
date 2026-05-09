import React, { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle, Stethoscope } from 'lucide-react';

const INITIAL_REQUESTS = [
  {
    id: 'r1', name: 'Meera Joshi',   initials: 'MJ', color: '#0B5C6B',
    time: '10 May, 2:00 pm – 2:30 pm',
    type: 'Cardiology Consultation',
    reason: 'Recurring chest tightness after physical activity.',
    priority: 'high',
  },
  {
    id: 'r2', name: 'Vikram Nair',   initials: 'VN', color: '#2E93A3',
    time: '10 May, 3:00 pm – 3:30 pm',
    type: 'Follow-up',
    reason: 'Post-surgery wound check, 2 weeks after appendectomy.',
    priority: 'medium',
  },
  {
    id: 'r3', name: 'Fatima Sheikh', initials: 'FS', color: '#1a7a8a',
    time: '11 May, 9:00 am – 9:30 am',
    type: 'General Consultation',
    reason: 'Persistent migraine for 3 days with light sensitivity.',
    priority: 'medium',
  },
  {
    id: 'r4', name: 'Arjun Pillai',  initials: 'AP', color: '#0B5C6B',
    time: '11 May, 10:30 am – 11:00 am',
    type: 'Routine Check-up',
    reason: 'Annual physical and blood work review.',
    priority: 'low',
  },
];

/**
 * AppointmentRequests – accept/reject pending appointment requests.
 * Maps to cancelAppointment (reject) and confirms acceptance via state.
 * In production, wire to PATCH /api/appointments/:id/status
 */
export default function AppointmentRequests() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [processing, setProcessing] = useState(null);

  const handleAction = (id, action) => {
    setProcessing(`${id}-${action}`);
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setProcessing(null);
    }, 600);
  };

  return (
    <div className="dd-card" id="appointment-requests-card">
      <div className="dd-card-header">
        <span className="dd-card-title">Appointment Requests</span>
        <button className="dd-card-action">See All</button>
      </div>

      {requests.length === 0 ? (
        <div className="dd-empty">
          <CheckCircle size={36} className="dd-empty-icon" color="var(--border)" />
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="dd-requests">
          {requests.map((r) => (
            <div className="dd-request-card" key={r.id} id={`request-${r.id}`}>
              {/* Header */}
              <div className="dd-request-head">
                <div className="dd-request-avatar" style={{ background: r.color }}>
                  {r.initials}
                </div>
                <div>
                  <div className="dd-request-name">{r.name}</div>
                  <div className="dd-request-time">
                    <Clock size={11} style={{ marginRight: 3 }} />
                    {r.time}
                  </div>
                </div>
                <span className={`p-badge ${r.priority}`} style={{ marginLeft: 'auto' }}>
                  {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
                </span>
              </div>

              {/* Type */}
              <div className="dd-request-type">
                <Stethoscope size={12} />
                {r.type}
              </div>

              {/* Reason */}
              <div className="dd-request-reason">"{r.reason}"</div>

              {/* Actions */}
              <div className="dd-request-actions">
                <button
                  id={`reject-${r.id}`}
                  className="dd-req-btn reject"
                  onClick={() => handleAction(r.id, 'reject')}
                  disabled={!!processing}
                >
                  <XCircle size={13} style={{ marginRight: 4 }} />
                  Reject
                </button>
                <button
                  id={`accept-${r.id}`}
                  className="dd-req-btn accept"
                  onClick={() => handleAction(r.id, 'accept')}
                  disabled={!!processing}
                >
                  <CheckCircle size={13} style={{ marginRight: 4 }} />
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
