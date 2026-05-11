import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, MapPin, AlertCircle, Check } from 'lucide-react';
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
    <div className="patient-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>My Appointments</h1>
            <p>Manage and track all your healthcare appointments</p>
          </div>
          <Link to="/booking" className="btn-primary btn-primary-lg">
            <Plus size={18} />
            Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon upcoming">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{appointments.filter(a => isUpcoming(a.appointmentDate)).length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <Check size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{appointments.filter(a => !isUpcoming(a.appointmentDate)).length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="appointment-tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          >
            Past Appointments
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="appointments-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="appointment-card-skeleton">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="alert-error">
            <AlertCircle size={20} />
            <div>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} strokeWidth={1.5} />
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
          <div className="appointments-list">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-card-header">
                  <div className="appointment-doctor">
                    <div className="doctor-avatar">
                      {appointment.doctorId?.profile?.firstName?.[0]}
                      {appointment.doctorId?.profile?.lastName?.[0]}
                    </div>
                    <div>
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

                <div className="appointment-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <div>
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(appointment.appointmentDate)}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Clock size={16} />
                    <div>
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{formatTime(appointment.timeSlot)}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <MapPin size={16} />
                    <div>
                      <span className="detail-label">Hospital</span>
                      <span className="detail-value">{appointment.hospitalId?.name}</span>
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="appointment-reason">
                    <span className="reason-label">Reason:</span>
                    <p>{appointment.reason}</p>
                  </div>
                )}

                {appointment.priority && appointment.priority.reasoning && (
                  <div className="appointment-ai-analysis">
                    <span className="analysis-label">AI Priority Analysis:</span>
                    <p>{appointment.priority.reasoning}</p>
                    {appointment.priority.riskFactors?.length > 0 && (
                      <div className="risk-factors">
                        <span className="risk-label">Risk Factors:</span>
                        <div className="risk-tags">
                          {appointment.priority.riskFactors.map((factor, idx) => (
                            <span key={idx} className="risk-tag">{factor}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  <span className="appointment-id">ID: {appointment.appointmentId}</span>
                </div>

                <div className="appointment-actions">
                  {isUpcoming(appointment.appointmentDate) && (
                    <>
                      <button className="btn-secondary">Reschedule</button>
                      <button className="btn-outline-danger">Cancel</button>
                    </>
                  )}
                  <button className="btn-outline">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
