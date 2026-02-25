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

export const couponService = {
    validate: async (code: string, courseId: string) => {
        const response = await axios.post(`${API_URL}/coupons/validate`,
            { code, courseId },
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};
