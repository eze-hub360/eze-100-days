import api from './api';

export const getFeed = async () => {
  const response = await api.get('/community/feed');
  return response.data;
};

export const toggleLike = async (targetId, targetType) => {
  const response = await api.post('/community/like', { targetId, targetType });
  return response.data;
};

export const addComment = async (logId, text) => {
  const response = await api.post('/community/comment', { logId, text });
  return response.data;
};

export const getComments = async (logId) => {
  const response = await api.get(`/community/comments/${logId}`);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.post(`/community/follow/${userId}`);
  return response.data;
};

export const getFollowers = async (userId) => {
  const response = await api.get(`/community/followers/${userId}`);
  return response.data;
};

export const getFollowing = async (userId) => {
  const response = await api.get(`/community/following/${userId}`);
  return response.data;
};