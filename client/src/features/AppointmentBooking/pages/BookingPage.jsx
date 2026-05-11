import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { BookingOptionSelector, HospitalSelector, SpecializationSelector } from '../components/BookingOptions';
import { DoctorSelector } from '../components/DoctorSelector';
import { SlotSelector } from '../components/SlotSelector';
import { PatientDetailsForm } from '../components/PatientDetailsForm';
import { useHospitals, useDoctors, useSlots, useAppointmentBooking } from '../hooks/useAppointmentBooking';
import { appointmentValidation } from '../utils/appointmentValidation';
import '../styles/appointment-booking.css';

const STEPS = {
  OPTION: 'option',
  BY_HOSPITAL: 'by-hospital',
  BY_HOSPITAL_SPEC: 'by-hospital-spec',
  BY_HOSPITAL_DOCTOR: 'by-hospital-doctor',
  BY_SYMPTOMS: 'by-symptoms',
  BY_SYMPTOMS_DOCTOR: 'by-symptoms-doctor',
  DOCTOR_SELECT: 'doctor-select',
  SLOT_SELECT: 'slot-select',
  PATIENT_DETAILS: 'patient-details',
  REVIEW: 'review',
  CONFIRMATION: 'confirmation'
};

export function AppointmentBookingPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.OPTION);
  const [bookingType, setBookingType] = useState(null); // 'hospital' or 'symptoms'

  // State management
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientDetails, setPatientDetails] = useState(null);

  // Hooks
  const { hospitals, loading: hospitalsLoading, fetchHospitals } = useHospitals();
  const { doctors, loading: doctorsLoading, error: doctorsError, fetchDoctors, searchDoctorsBySymptoms } = useDoctors();
  const { slots, loading: slotsLoading, fetchSlots } = useSlots();
  const { bookAppointment, loading: bookingLoading, error: bookingError, success, appointmentData, resetState } = useAppointmentBooking();

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Update doctors when hospital or specialization changes
  useEffect(() => {
    if (selectedHospital && selectedSpec && bookingType === 'hospital') {
      fetchDoctors(selectedHospital.hospitalId, selectedSpec);
    }
  }, [selectedHospital, selectedSpec, bookingType]);

  // Update slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && startDate) {
      fetchSlots(selectedDoctor._id, startDate, 14);
    }
  }, [selectedDoctor, startDate]);

  const handleSelectOption = (option) => {
    setBookingType(option);
    if (option === 'hospital') {
      setCurrentStep(STEPS.BY_HOSPITAL);
    } else {
      setCurrentStep(STEPS.BY_SYMPTOMS);
    }
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setCurrentStep(STEPS.BY_HOSPITAL_SPEC);
  };

  const handleSpecSelect = (spec) => {
    setSelectedSpec(spec);
    setCurrentStep(STEPS.BY_HOSPITAL_DOCTOR);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(STEPS.SLOT_SELECT);
  };

  const handleSymptomSearch = async (symptomText) => {
    setSymptoms(symptomText);
    await searchDoctorsBySymptoms(symptomText, { start: startDate, days: 14 });
    setCurrentStep(STEPS.BY_SYMPTOMS_DOCTOR);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setCurrentStep(STEPS.PATIENT_DETAILS);
  };

  const handlePatientDetailsSubmit = (details) => {
    setPatientDetails(details);
    setCurrentStep(STEPS.REVIEW);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot || !patientDetails) {
      console.error('Missing booking data', { selectedDoctor, selectedSlot, patientDetails });
      return;
    }

    // For symptom-based flow, we need to get hospitalId from somewhere
    // In a real app, the doctor object should include hospitalId
    let hospitalId = selectedHospital?.hospitalId;
    if (!hospitalId && selectedDoctor.hospitalId) {
      hospitalId = selectedDoctor.hospitalId;
    }
    
    if (!hospitalId) {
      console.error('Hospital ID not found for booking');
      return;
    }

    // Construct appointmentDate as ISO string: YYYY-MM-DDTHH:mm:00Z
    // Format: 2026-05-12 + T + 10:00 + :00Z
    const appointmentDateStr = `${selectedSlot.date}T${selectedSlot.slot}:00Z`;
    
    const result = await bookAppointment({
      doctorId: selectedDoctor._id,
      hospitalId: hospitalId,
      appointmentDate: appointmentDateStr,
      timeSlot: selectedSlot.slot,
      reason: patientDetails.reason,
      age: patientDetails.age,
      gender: patientDetails.gender,
      phone: patientDetails.phone
    });

    if (result.success) {
      setCurrentStep(STEPS.CONFIRMATION);
    }
  };

  const handleGoBack = () => {
    const stepOrder = {
      [STEPS.OPTION]: null,
      [STEPS.BY_HOSPITAL]: STEPS.OPTION,
      [STEPS.BY_HOSPITAL_SPEC]: STEPS.BY_HOSPITAL,
      [STEPS.BY_HOSPITAL_DOCTOR]: STEPS.BY_HOSPITAL_SPEC,
      [STEPS.BY_SYMPTOMS]: STEPS.OPTION,
      [STEPS.BY_SYMPTOMS_DOCTOR]: STEPS.BY_SYMPTOMS,
      [STEPS.SLOT_SELECT]: bookingType === 'hospital' ? STEPS.BY_HOSPITAL_DOCTOR : STEPS.BY_SYMPTOMS_DOCTOR,
      [STEPS.PATIENT_DETAILS]: STEPS.SLOT_SELECT,
      [STEPS.REVIEW]: STEPS.PATIENT_DETAILS
    };

    const previousStep = stepOrder[currentStep];
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(STEPS.OPTION);
    setBookingType(null);
    setSelectedHospital(null);
    setSelectedSpec(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSymptoms('');
    setPatientDetails(null);
    resetState();
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.OPTION:
        return <BookingOptionSelector onSelectOption={handleSelectOption} />;

      case STEPS.BY_HOSPITAL:
        return (
          <div className="booking-step">
            <h2>Select Hospital</h2>
            <HospitalSelector
              hospitals={hospitals}
              loading={hospitalsLoading}
              onSelect={handleHospitalSelect}
              selectedHospital={selectedHospital}
            />
          </div>
        );

      case STEPS.BY_HOSPITAL_SPEC:
        return (
          <div className="booking-step">
            <h2>Select Specialization</h2>
            <SpecializationSelector
              hospital={selectedHospital}
              onSelect={handleSpecSelect}
              selectedSpec={selectedSpec}
            />
          </div>
        );

      case STEPS.BY_HOSPITAL_DOCTOR:
        return (
          <div className="booking-step">
            <h2>Choose Doctor</h2>
            <DoctorSelector
              doctors={doctors}
              loading={doctorsLoading}
              error={doctorsError}
              onSelect={handleDoctorSelect}
              selectedDoctor={selectedDoctor}
            />
          </div>
        );

      case STEPS.BY_SYMPTOMS:
        return (
          <div className="booking-step">
            <h2>Tell Us Your Symptoms</h2>
            <div className="symptom-input">
              <p className="symptom-hint">
                Our AI will match you with the best doctors across our hospital network
              </p>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., chest pain and shortness of breath, annual checkup, etc."
                className="form-input textarea"
                rows="5"
              />
              <button
                onClick={() => handleSymptomSearch(symptoms)}
                disabled={!symptoms.trim()}
                className="btn-primary btn-primary-lg"
              >
                Find Best Doctors
              </button>
            </div>
          </div>
        );

      case STEPS.BY_SYMPTOMS_DOCTOR:
        return (
          <div className="booking-step">
            <h2>Available Doctors (for: {symptoms})</h2>
            <DoctorSelector
              doctors={doctors}
              loading={doctorsLoading}
              error={doctorsError}
              onSelect={handleDoctorSelect}
              selectedDoctor={selectedDoctor}
            />
          </div>
        );

      case STEPS.SLOT_SELECT:
        return (
          <div className="booking-step">
            <h2>Choose Appointment Date & Time</h2>
            <div className="slot-date-input">
              <label>Start searching from:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <SlotSelector
              slots={slots}
              loading={slotsLoading}
              onSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
              minDate={startDate}
            />
          </div>
        );

      case STEPS.PATIENT_DETAILS:
        return (
          <div className="booking-step">
            <h2>Your Details</h2>
            <PatientDetailsForm onSubmit={handlePatientDetailsSubmit} />
          </div>
        );

      case STEPS.REVIEW:
        return (
          <div className="booking-step">
            <h2>Review Your Appointment</h2>
            <div className="review-summary">
              <div className="review-section">
                <h4>Doctor</h4>
                <p>
                  {selectedDoctor?.name || 
                   `Dr. ${selectedDoctor?.profile?.firstName} ${selectedDoctor?.profile?.lastName}`}
                </p>
                <small>{selectedDoctor?.specialization || selectedDoctor?.profile?.specialization}</small>
              </div>

              <div className="review-section">
                <h4>Hospital</h4>
                <p>{selectedHospital?.name || selectedDoctor?.hospitalName || 'Not specified'}</p>
              </div>

              <div className="review-section">
                <h4>Appointment</h4>
                <p>{new Date(selectedSlot?.date).toLocaleDateString()} at {selectedSlot?.slot}</p>
              </div>

              <div className="review-section">
                <h4>Your Information</h4>
                <p>Age: {patientDetails?.age}, Gender: {patientDetails?.gender}</p>
              </div>

              <div className="review-section">
                <h4>Reason for Visit</h4>
                <p>{patientDetails?.reason}</p>
              </div>

              {bookingError && (
                <div className="form-error alert-error">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Booking Error</strong>
                    <p>{bookingError}</p>
                  </div>
                </div>
              )}

              <div className="review-actions">
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="btn-primary btn-primary-lg"
                >
                  {bookingLoading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case STEPS.CONFIRMATION:
        return (
          <div className="booking-step">
            <div className="confirmation-card">
              <div className="confirmation-icon">
                <CheckCircle size={64} color="var(--primary)" fill="var(--primary)" />
              </div>
              <h2>Appointment Confirmed!</h2>
              <p>Your appointment has been successfully booked</p>

              <div className="confirmation-details">
                <div className="detail-item">
                  <span className="label">Appointment ID</span>
                  <span className="value">{appointmentData?.appointmentId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Doctor</span>
                  <span className="value">Dr. {selectedDoctor?.profile?.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date & Time</span>
                  <span className="value">{selectedSlot?.date} {selectedSlot?.slot}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Priority</span>
                  <span className={`priority-badge priority-${appointmentData?.priority?.level}`}>
                    {appointmentData?.priority?.level?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="confirmation-actions">
                <button onClick={handleStartOver} className="btn-primary btn-primary-lg">
                  Book Another Appointment
                </button>
                <a href="/patient/dashboard" className="btn-outline">
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="appointment-booking-page">
      <div className="booking-container">
        {/* Header with back button */}
        {currentStep !== STEPS.OPTION && currentStep !== STEPS.CONFIRMATION && (
          <div className="booking-header">
            <button onClick={handleGoBack} className="back-btn" aria-label="Go back">
              <ChevronLeft size={20} />
            </button>
            <h1>Book Appointment</h1>
          </div>
        )}

        {/* Progress indicator */}
        {currentStep !== STEPS.OPTION && currentStep !== STEPS.CONFIRMATION && (
          <div className="booking-progress">
            {/* Simple progress indicator */}
          </div>
        )}

        {/* Main content */}
        <div className="booking-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default AppointmentBookingPage;
