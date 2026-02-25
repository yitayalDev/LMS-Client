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

export const analyticsService = {
    getInstructorStats: async () => {
        const response = await axios.get(`${API_URL}/analytics/instructor`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getAdminStats: async () => {
        const response = await axios.get(`${API_URL}/analytics/admin`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getStudentProgressStats: async () => {
        const response = await axios.get(`${API_URL}/analytics/student`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};
