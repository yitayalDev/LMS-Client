import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

export const notificationService = {
    // Get all notifications with pagination
    getNotifications: async (page = 1, limit = 20) => {
        const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Mark a specific notification as read
    markAsRead: async (notificationId: string) => {
        const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};
