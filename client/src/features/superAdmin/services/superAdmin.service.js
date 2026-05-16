import apiClient from '../../../services/apiClient';

export async function getOverview() {
  const { data } = await apiClient.get('/super-admin/overview');
  return data;
}

export async function listPendingHospitals() {
  const { data } = await apiClient.get('/super-admin/hospitals/pending');
  return data;
}

export async function approveHospital(hospitalId, data) {
  const response = await apiClient.post(`/super-admin/hospitals/${hospitalId}/approve`, data);
  return response.data;
}

export async function rejectHospital(hospitalId, data) {
  const response = await apiClient.post(`/super-admin/hospitals/${hospitalId}/reject`, data);
  return response.data;
}

export async function listAllHospitals() {
  const { data } = await apiClient.get('/hospitals');
  return data;
}

export default { getOverview, listPendingHospitals, approveHospital, rejectHospital, listAllHospitals };
