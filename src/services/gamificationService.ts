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

export const gamificationService = {
    getLeaderboard: async () => {
        const response = await axios.get(`${API_URL}/gamification/leaderboard`);
        return response.data;
    },

    getMyRewards: async () => {
        const response = await axios.get(`${API_URL}/gamification/me`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};
