import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { appointmentValidation } from '../utils/appointmentValidation';
import '../styles/appointment-booking.css';

export function PatientDetailsForm({ onSubmit, isLoading = false, initialData = {} }) {
  const [formData, setFormData] = useState({
    reason: initialData.reason || '',
    age: initialData.age || '',
    gender: initialData.gender || 'male',
    phone: initialData.phone || '',
    medicalHistory: initialData.medicalHistory || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = appointmentValidation.validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      <div className="form-section">
        <h3 className="form-section-title">Your Symptoms & Reason</h3>
        
        <div className="form-group">
          <label htmlFor="reason">
            Describe your symptoms or reason for visit *
            <span className="form-hint">Be specific (e.g., "chest pain for 2 days", "annual checkup")</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            onFocus={() => setFocused('reason')}
            onBlur={() => setFocused(null)}
            placeholder="I'm experiencing..."
            className={`form-input textarea ${errors.reason ? 'error' : ''} ${focused === 'reason' ? 'focused' : ''}`}
            rows="4"
            maxLength="500"
          />
          <div className="char-count">{formData.reason.length}/500</div>
          {errors.reason && (
            <div className="form-error">
              <AlertCircle size={16} />
              {errors.reason}
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Your Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              onFocus={() => setFocused('age')}
              onBlur={() => setFocused(null)}
              placeholder="Your age"
              min="1"
              max="120"
              className={`form-input ${errors.age ? 'error' : ''} ${focused === 'age' ? 'focused' : ''}`}
            />
            {errors.age && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.age}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.gender}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Contact Number (Optional)</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className={`form-input ${errors.phone ? 'error' : ''}`}
          />
          {errors.phone && (
            <div className="form-error">
              <AlertCircle size={16} />
              {errors.phone}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="medicalHistory">Medical History (Optional)</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="Any past surgeries, allergies, or chronic conditions..."
            className="form-input textarea"
            rows="3"
            maxLength="300"
          />
          <div className="char-count">{formData.medicalHistory.length}/300</div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary btn-primary-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Review'}
        </button>
      </div>
    </form>
  );
}

export default PatientDetailsForm;
