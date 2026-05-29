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
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          toast.success('Welcome back! 🎉');
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          return false;
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { token, ...user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
          toast.success('Account created successfully! 🎉');
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          return false;
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },
      
    //   updateUser: (userData) => {
    //     set({ user: { ...get().user, ...userData } });
    //   },

    updateUser: (userData) => {
  const currentUser = get().user;
  const updatedUser = { ...currentUser, ...userData };
  set({ user: updatedUser });
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(updatedUser));
},
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;