import { useState, useCallback } from 'react';
import * as api from '../services/superAdmin.service';

export default function useSuperAdmin() {
  const [overview, setOverview] = useState(null);
  const [pending, setPending] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOverview();
      setOverview(res);
      setError(null);
    } catch (err) { setError(err); }
    setLoading(false);
  }, []);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listPendingHospitals();
      setPending(res.hospitals || []);
      setError(null);
    } catch (err) { setError(err); }
    setLoading(false);
  }, []);

  const loadAllHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAllHospitals();
      setHospitals(res.hospitals || res || []);
      setError(null);
    } catch (err) { setError(err); }
    setLoading(false);
  }, []);

  const approve = useCallback(async (hospitalId, notes) => {
    setLoading(true);
    try {
      const res = await api.approveHospital(hospitalId, { reviewNotes: notes });
      await loadPending();
      await loadAllHospitals();
      setLoading(false);
      return res;
    } catch (err) { setError(err); setLoading(false); throw err; }
  }, [loadPending, loadAllHospitals]);

  const reject = useCallback(async (hospitalId, notes) => {
    setLoading(true);
    try {
      const res = await api.rejectHospital(hospitalId, { reviewNotes: notes });
      await loadPending();
      await loadAllHospitals();
      setLoading(false);
      return res;
    } catch (err) { setError(err); setLoading(false); throw err; }
  }, [loadPending, loadAllHospitals]);

  return {
    overview, pending, hospitals, loading, error,
    loadOverview, loadPending, loadAllHospitals, approve, reject
  };
}
