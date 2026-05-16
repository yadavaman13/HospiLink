import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Heart, Calendar, ClipboardList, Clock,
  MapPin, User, CheckCircle, AlertCircle, Plus
} from 'lucide-react';
import '../styles/patient-dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (dateStr) => {
    return new Date(dateStr) >= new Date();
  };

  const filteredAppointments = appointments.filter(apt => {
    const upcoming = isUpcoming(apt.appointmentDate);
    return activeTab === 'upcoming' ? upcoming : !upcoming;
  });

  return (
    <div className="hl-dashboard">
      <div className="hl-app-wrapper">
        {/* Left Sidebar */}
        <aside className="hl-sidebar">
          <div className="hl-logo">
            <span>HospiLink</span>
          </div>
          <nav className="hl-nav">
            <button className="active"><LayoutDashboard size={20} /> <span>Dashboard</span></button>
            <button><Calendar size={20} /> <span>Appointments</span></button>
            <button><ClipboardList size={20} /> <span>Records</span></button>
            <button><User size={20} /> <span>Profile</span></button>
          </nav>
        </aside>

        {/* Main Area */}
        <main className="hl-main">
          {/* Header */}
          <header className="hl-header">
            <div className="hl-breadcrumb">Patient Dashboard</div>
            <div className="hl-header-actions">
              <div className="header-user">
                <div className="header-user-avatar">P</div>
                <div className="header-user-info">
                  <span className="name">Patient Profile</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Wrapper */}
          <div className="hl-content-main">
            
            <div className="hl-welcome">
              <div>
                <h1>My Appointments</h1>
                <p>Manage and track all your healthcare appointments</p>
              </div>
              <Link to="/booking" className="btn-primary">
                <Plus size={18} /> Book Appointment
              </Link>
            </div>

            {/* Tabs */}
            <div className="hl-tabs">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`hl-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`hl-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              >
                Past Appointments
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="appointments-skeleton">
                {[1, 2, 3].map(i => (
                  <div key={i} className="appointment-card-skeleton"></div>
                ))}
              </div>
            ) : error ? (
              <div className="alert-error" style={{ display: 'flex', gap: '12px', background: '#fee2e2', padding: '16px', borderRadius: '8px', color: '#dc2626' }}>
                <AlertCircle size={20} />
                <div>
                  <strong>Error</strong>
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="hl-empty">
                <Calendar size={64} strokeWidth={1.5} />
                <h3>No {activeTab} appointments</h3>
                <p>
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming appointments. Book one now!"
                    : 'No past appointments to show yet'}
                </p>
                {activeTab === 'upcoming' && (
                  <Link to="/booking" className="btn-primary">
                    Book Appointment
                  </Link>
                )}
              </div>
            ) : (
              <div className="hl-section">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment._id} className="hl-apt-item">
                    <div className="hl-apt-header">
                      <div className="hl-doctor-info">
                        <div className="hl-doctor-avatar">
                          {appointment.doctorId?.profile?.firstName?.[0]}
                          {appointment.doctorId?.profile?.lastName?.[0]}
                        </div>
                        <div className="hl-doctor-details">
                          <h4>Dr. {appointment.doctorId?.profile?.firstName} {appointment.doctorId?.profile?.lastName}</h4>
                          <p>{appointment.doctorId?.profile?.specialization}</p>
                        </div>
                      </div>
                      {appointment.priority && (
                        <div className={`priority-badge priority-${appointment.priority?.level}`}>
                          {appointment.priority?.level?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="hl-apt-meta">
                      <div className="hl-meta-item">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="hl-meta-item">
                        <Clock size={16} />
                        <span>{formatTime(appointment.timeSlot)}</span>
                      </div>
                      <div className="hl-meta-item">
                        <MapPin size={16} />
                        <span>{appointment.hospitalId?.name}</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="hl-apt-reason">
                        <strong>Reason:</strong> {appointment.reason}
                      </div>
                    )}

                    {appointment.priority && appointment.priority.reasoning && (
                      <div className="hl-ai-analysis">
                        <span className="analysis-label">AI Priority Analysis</span>
                        <p>{appointment.priority.reasoning}</p>
                        {appointment.priority.riskFactors?.length > 0 && (
                          <div className="risk-factors">
                            <span className="analysis-label" style={{ display: 'inline', marginRight: '8px', fontSize: '11px' }}>Risk Factors:</span>
                            <div className="risk-tags">
                              {appointment.priority.riskFactors.map((factor, idx) => (
                                <span key={idx} className="risk-tag">{factor}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="hl-apt-footer">
                      <div className="hl-apt-status">
                        <span className={`status-badge status-${appointment.status}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          ID: {appointment.appointmentId}
                        </span>
                      </div>

                      <div className="hl-apt-actions">
                        {isUpcoming(appointment.appointmentDate) && (
                          <>
                            <button className="btn-secondary">Reschedule</button>
                            <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: '#fecaca' }}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default PatientDashboard;
