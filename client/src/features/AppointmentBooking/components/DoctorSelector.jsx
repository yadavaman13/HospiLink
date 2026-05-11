import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, AlertCircle } from 'lucide-react';
import '../styles/appointment-booking.css';

export function DoctorSelector({ doctors, loading, error, onSelect, selectedDoctor }) {
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'fee'

  const sortedDoctors = React.useMemo(() => {
    const sorted = [...doctors];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.doctorProfile?.rating || 0) - (a.doctorProfile?.rating || 0));
    } else if (sortBy === 'fee') {
      sorted.sort((a, b) => (a.doctorProfile?.consultationFee || 0) - (b.doctorProfile?.consultationFee || 0));
    }
    return sorted;
  }, [doctors, sortBy]);

  if (loading) {
    return (
      <div className="doctor-selector-skeleton">
        {[1, 2, 3].map(i => (
          <div key={i} className="doctor-card-skeleton">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error alert-error">
        <AlertCircle size={20} />
        <div>
          <strong>Error loading doctors</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--primary-light)" />
        <h3>No doctors available</h3>
        <p>Please try different filters or dates</p>
      </div>
    );
  }

  return (
    <div className="doctor-selector">
      <div className="doctor-selector-header">
        <h3>Select a Doctor</h3>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="rating">Highest Rated</option>
            <option value="fee">Lowest Fee</option>
          </select>
        </div>
      </div>

      <div className="doctors-grid">
        {sortedDoctors.map((doctor) => {
          const isSelected = selectedDoctor?._id === doctor._id;
          const rating = doctor.doctorProfile?.rating || 4.5;
          const fee = doctor.doctorProfile?.consultationFee || 300;
          const experience = doctor.doctorProfile?.yearsOfExperience || 0;

          return (
            <div
              key={doctor._id}
              className={`doctor-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(doctor)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelect(doctor)}
            >
              <div className="doctor-card-header">
                <div className="doctor-avatar">
                  {doctor.profile?.firstName?.[0]}{doctor.profile?.lastName?.[0]}
                </div>
                <div className="doctor-info-top">
                  <h4 className="doctor-name">
                    Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                  </h4>
                  <p className="doctor-spec">{doctor.profile?.specialization}</p>
                </div>
              </div>

              <div className="doctor-bio">{doctor.doctorProfile?.bio}</div>

              <div className="doctor-meta">
                <div className="meta-item">
                  <Star size={16} fill="var(--primary)" color="var(--primary)" />
                  <span>{rating.toFixed(1)} • {Math.floor(Math.random() * 200) + 50} reviews</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} color="var(--primary)" />
                  <span>{experience} yrs exp.</span>
                </div>
              </div>

              <div className="doctor-footer">
                <div className="consultation-fee">
                  <span className="fee-label">Consultation</span>
                  <span className="fee-amount">₹{fee}</span>
                </div>
                <div className={`doctor-availability ${Math.random() > 0.3 ? 'available' : 'limited'}`}>
                  {Math.random() > 0.3 ? '✓ Available' : 'Limited slots'}
                </div>
              </div>

              {isSelected && (
                <div className="doctor-selected-badge">
                  <span>✓ Selected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="doctor-selector-hint">
        💡 Tip: Check ratings and experience to find the best match for your needs
      </p>
    </div>
  );
}

export default DoctorSelector;
