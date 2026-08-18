import axios from 'axios';
import { EmailRecord, DashboardStats, SchedulePayload, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  googleLogin: async (credential?: string, userInfo?: Partial<User>) => {
    const response = await api.post<{ success: boolean; user: User }>('/auth/google', {
      credential,
      userInfo,
    });
    return response.data;
  },
};

export const emailAPI = {
  scheduleEmails: async (payload: SchedulePayload) => {
    const response = await api.post<{ success: boolean; message: string; count: number }>('/emails/schedule', payload);
    return response.data;
  },

  getScheduledEmails: async () => {
    const response = await api.get<{ success: boolean; data: EmailRecord[] }>('/emails/scheduled');
    return response.data;
  },

  getSentEmails: async () => {
    const response = await api.get<{ success: boolean; data: EmailRecord[] }>('/emails/sent');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/emails/stats');
    return response.data;
  },

  cancelScheduledEmail: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/emails/${id}/cancel`);
    return response.data;
  },
};

export default api;
