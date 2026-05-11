import { useState, useCallback } from 'react';
import { appointmentValidation } from '../utils/appointmentValidation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook to manage hospitals and fetch hospitals
 */
export function useHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/hospitals/list`);
      if (!response.ok) throw new Error('Failed to fetch hospitals');
      const data = await response.json();
      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { hospitals, loading, error, fetchHospitals };
}

/**
 * Hook to fetch doctors by hospital and specialization
 */
export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async (hospitalId, specialization = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ hospitalId });
      if (specialization) params.append('specialization', specialization);
      
      const response = await fetch(`${API_URL}/appointments/search-doctors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDoctorsBySymptoms = useCallback(async (symptoms, dateRange) => {
    setLoading(true);
    setError(null);
    try {
      // Extract likely specializations from symptoms
      const specializations = appointmentValidation.extractSpecializations(symptoms);
      
      // Fetch all hospitals
      const hospitalsRes = await fetch(`${API_URL}/hospitals/list`);
      if (!hospitalsRes.ok) throw new Error('Failed to fetch hospitals');
      const hospitalsData = await hospitalsRes.json();
      
      // Search doctors across all hospitals for each specialization
      const allDoctors = [];
      for (const spec of specializations) {
        for (const hospital of hospitalsData.hospitals) {
          const params = new URLSearchParams({
            hospitalId: hospital.hospitalId,
            specialization: spec
          });
          
          const docRes = await fetch(`${API_URL}/appointments/search-doctors?${params}`);
          if (docRes.ok) {
            const docData = await docRes.json();
            allDoctors.push(...(docData.doctors || []));
          }
        }
      }
      
      // Remove duplicates by doctor ID
      const uniqueDoctors = Array.from(
        new Map(allDoctors.map(doc => [doc._id, doc])).values()
      );
      
      setDoctors(uniqueDoctors);
    } catch (err) {
      setError(err.message);
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { doctors, loading, error, fetchDoctors, searchDoctorsBySymptoms };
}

/**
 * Hook to fetch available appointment slots
 */
export function useSlots() {
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async (doctorId, startDate, daysAhead = 7) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/appointments/available-slots?` +
        new URLSearchParams({
          doctorId,
          startDate,
          daysAhead
        })
      );
      
      if (!response.ok) throw new Error('Failed to fetch slots');
      const data = await response.json();
      setSlots(data.slots || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching slots:', err);
      setSlots({});
    } finally {
      setLoading(false);
    }
  }, []);

  return { slots, loading, error, fetchSlots };
}

/**
 * Hook to manage appointment booking
 */
export function useAppointmentBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const bookAppointment = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form data
    const validation = appointmentValidation.validateBookingForm(bookingData);
    if (!validation.isValid) {
      setError('Please fill all required fields correctly');
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    try {
      const response = await fetch(`${API_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctorId: bookingData.doctorId,
          hospitalId: bookingData.hospitalId,
          appointmentDate: bookingData.appointmentDate,
          timeSlot: bookingData.timeSlot,
          appointmentType: 'consultation',
          reason: bookingData.reason,
          patientAge: bookingData.age,
          patientGender: bookingData.gender,
          phone: bookingData.phone || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to book appointment');
      }

      const data = await response.json();
      setAppointmentData(data.appointment);
      setSuccess(true);
      return { success: true, appointment: data.appointment };

    } catch (err) {
      setError(err.message);
      console.error('Error booking appointment:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setAppointmentData(null);
  }, []);

  return {
    loading,
    error,
    success,
    appointmentData,
    bookAppointment,
    resetState
  };
}
