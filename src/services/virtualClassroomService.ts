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

export const virtualClassroomService = {
    getMyUpcomingSessions: async () => {
        const response = await axios.get(`${API_URL}/virtual-classrooms/my-sessions`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getCourseSessions: async (courseId: string) => {
        const response = await axios.get(`${API_URL}/virtual-classrooms/course/${courseId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getInstructorSessions: async () => {
        const response = await axios.get(`${API_URL}/virtual-classrooms`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    createSession: async (data: any) => {
        const response = await axios.post(`${API_URL}/virtual-classrooms`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    updateSessionStatus: async (sessionId: string, status: string) => {
        const response = await axios.patch(`${API_URL}/virtual-classrooms/${sessionId}/status`, { status }, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};
