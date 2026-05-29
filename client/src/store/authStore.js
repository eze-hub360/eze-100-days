import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      
      // Email/Password Login
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isLoading: false });
          toast.success(`Welcome back, ${user.name}! 🎉`);
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          return false;
        }
      },
      
      // Google Login (receives user and token directly)
      googleLogin: (userData, token) => {
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          set({ user: userData, token, isLoading: false });
          toast.success(`Welcome ${userData.name}! 🎉`);
          return true;
        } catch (error) {
          console.error('Google login error:', error);
          toast.error('Google login failed');
          return false;
        }
      },
      
      // Register with Email/Password
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isLoading: false });
          toast.success('Account created successfully! 🎉');
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          return false;
        }
      },
      
      // Logout
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },
      
      // Update user data (for profile edits)
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },
      
      // Check if user is authenticated
      isAuthenticated: () => {
        const token = localStorage.getItem('token');
        const user = get().user;
        return !!(token && user);
      },
      
      // Get current user
      getCurrentUser: () => {
        return get().user;
      },
      
      // Get auth token
      getToken: () => {
        return get().token || localStorage.getItem('token');
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;  