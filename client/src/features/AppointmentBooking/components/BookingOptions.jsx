import React, { useState } from 'react';
import { Building2, AlertCircle, Stethoscope } from 'lucide-react';
import '../styles/appointment-booking.css';

export function BookingOptionSelector({ onSelectOption }) {
  return (
    <div className="booking-options">
      <h2 className="booking-title">How would you like to book?</h2>
      <p className="booking-subtitle">Choose the method that works best for you</p>

      <div className="options-grid">
        {/* Option 1: By Hospital */}
        <button
          onClick={() => onSelectOption('hospital')}
          className="option-card option-card-hospital"
        >
          <div className="option-icon">
            <Building2 size={40} strokeWidth={1.5} />
          </div>
          <h3>Book at Specific Hospital</h3>
          <p>
            Know which hospital you want to visit? Browse doctors and specialties at that location
          </p>
          <div className="option-badge">Popular</div>
        </button>

        {/* Option 2: By Symptoms */}
        <button
          onClick={() => onSelectOption('symptoms')}
          className="option-card option-card-symptoms"
        >
          <div className="option-icon symptoms">
            <Stethoscope size={40} strokeWidth={1.5} />
          </div>
          <h3>Find Doctor by Symptoms</h3>
          <p>
            Tell us your symptoms and we'll find the best doctors across our hospital network
          </p>
          <div className="option-badge ai-badge">AI-Powered</div>
        </button>
      </div>
    </div>
  );
}

export function HospitalSelector({ hospitals, loading, error, onSelect, selectedHospital }) {
  if (loading) {
    return (
      <div className="hospital-selector-skeleton">
        {[1, 2].map(i => (
          <div key={i} className="hospital-card-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
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
          <strong>Error loading hospitals</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--primary-light)" />
        <h3>No hospitals available</h3>
        <p>Please try again later</p>
      </div>
    );
  }

  return (
    <div className="hospital-selector">
      <h3>Select Hospital</h3>

      <div className="hospitals-list">
        {hospitals.map((hospital) => {
          const isSelected = selectedHospital?._id === hospital._id;

          return (
            <div
              key={hospital._id}
              className={`hospital-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(hospital)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelect(hospital)}
            >
              <div className="hospital-card-header">
                <div className="hospital-icon">
                  <Building2 size={24} />
                </div>
                <div className="hospital-info">
                  <h4 className="hospital-name">{hospital.name}</h4>
                  <p className="hospital-location">
                    {hospital.address?.city}, {hospital.address?.state}
                  </p>
                </div>
              </div>

              <div className="hospital-meta">
                <span className="meta-badge beds">
                  {hospital.beds?.available || 0} beds available
                </span>
                <span className="meta-badge departments">
                  {hospital.departments?.length || 0} departments
                </span>
              </div>

              {isSelected && (
                <div className="hospital-selected-badge">✓ Selected</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SpecializationSelector({ hospital, onSelect, selectedSpec }) {
  if (!hospital || !hospital.departments) {
    return null;
  }

  const specializations = hospital.departments.map(dept => dept.name);

  return (
    <div className="specialization-selector">
      <h3>Select Specialization</h3>
      <div className="spec-grid">
        {specializations.map((spec) => (
          <button
            key={spec}
            onClick={() => onSelect(spec)}
            className={`spec-btn ${selectedSpec === spec ? 'selected' : ''}`}
          >
            {spec}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BookingOptionSelector;
