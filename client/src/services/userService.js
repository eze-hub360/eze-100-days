import api from './api';

export const getUserProfile = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await api.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

export const getLeaderboard = async (type = 'xp') => {
    try {
        const response = await api.get(`/users/leaderboard?type=${type}`);
        return response.data;
    } catch (error) {
        console.error('Leaderboard error:', error);
        throw error;
    }
};