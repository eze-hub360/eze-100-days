import api from './api';

export const createDailyLog = async (formData) => {
  const response = await api.post('/logs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getChallengeLogs = async (challengeId) => {
  const response = await api.get(`/logs/challenge/${challengeId}`);
  return response.data;
};

export const updateDailyLog = async (id, data) => {
  const response = await api.put(`/logs/${id}`, data);
  return response.data;
};