// Validation utilities for appointment booking
export const appointmentValidation = {
  // Validate appointment reason
  validateReason: (reason) => {
    if (!reason || reason.trim().length === 0) {
      return { valid: false, error: 'Please describe your symptoms or reason for visit' };
    }
    if (reason.length < 5) {
      return { valid: false, error: 'Reason must be at least 5 characters' };
    }
    if (reason.length > 500) {
      return { valid: false, error: 'Reason must not exceed 500 characters' };
    }
    return { valid: true };
  },

  // Validate patient age
  validateAge: (age) => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return { valid: false, error: 'Please enter a valid age (1-120)' };
    }
    return { valid: true };
  },

  // Validate phone
  validatePhone: (phone) => {
    const phoneRegex = /^[+]?[0-9\s-()]{7,}$/;
    if (!phoneRegex.test(phone)) {
      return { valid: false, error: 'Please enter a valid phone number' };
    }
    return { valid: true };
  },

  // Validate appointment date (not in past)
  validateAppointmentDate: (date) => {
    const appointmentDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < now) {
      return { valid: false, error: 'Cannot book appointments in the past' };
    }
    
    // Check if within next 90 days
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 90);
    if (appointmentDate > maxDate) {
      return { valid: false, error: 'Can only book up to 90 days in advance' };
    }
    
    return { valid: true };
  },

  // Validate all appointment form data
  validateBookingForm: (data) => {
    const errors = {};

    if (!data.reason) errors.reason = 'Reason is required';
    else {
      const reasonVal = appointmentValidation.validateReason(data.reason);
      if (!reasonVal.valid) errors.reason = reasonVal.error;
    }

    if (!data.age) errors.age = 'Age is required';
    else {
      const ageVal = appointmentValidation.validateAge(data.age);
      if (!ageVal.valid) errors.age = ageVal.error;
    }

    if (!data.gender) errors.gender = 'Gender is required';

    if (data.phone) {
      const phoneVal = appointmentValidation.validatePhone(data.phone);
      if (!phoneVal.valid) errors.phone = phoneVal.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Symptom to specialization mapping
  symptomToSpecialization: {
    'chest pain': 'Cardiology',
    'heart': 'Cardiology',
    'palpitation': 'Cardiology',
    'headache': 'Neurology',
    'migraine': 'Neurology',
    'stroke': 'Neurology',
    'dizziness': 'Neurology',
    'bone': 'Orthopedics',
    'joint': 'Orthopedics',
    'fracture': 'Orthopedics',
    'knee': 'Orthopedics',
    'back pain': 'Orthopedics',
    'fever': 'General Medicine',
    'cough': 'General Medicine',
    'cold': 'General Medicine',
    'checkup': 'General Medicine',
    'routine': 'General Medicine'
  },

  // Extract likely specializations from symptoms
  extractSpecializations: (symptoms) => {
    if (!symptoms) return ['General Medicine'];
    
    const lowerSymptoms = symptoms.toLowerCase();
    const foundSpecializations = new Set(['General Medicine']);

    Object.entries(appointmentValidation.symptomToSpecialization).forEach(([symptom, spec]) => {
      if (lowerSymptoms.includes(symptom)) {
        foundSpecializations.add(spec);
      }
    });

    return Array.from(foundSpecializations);
  }
};
