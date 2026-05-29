import api from './api';

export const createChallenge = async (challengeData) => {
  const response = await api.post('/challenges', challengeData);
  return response.data;
};

export const getChallenges = async () => {
  const response = await api.get('/challenges');
  return response.data;
};

export const getChallenge = async (id) => {
  const response = await api.get(`/challenges/${id}`);
  return response.data;
};

export const getChallengeProgress = async (id) => {
  const response = await api.get(`/challenges/${id}/progress`);
  return response.data;
};

export const updateChallenge = async (id, data) => {
  const response = await api.put(`/challenges/${id}`, data);
  return response.data;
};