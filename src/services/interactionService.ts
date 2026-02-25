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

// Course Discussions API Service
export const discussionService = {
    // Get discussions for a specific course
    getDiscussions: async (courseId: string, moduleId?: string) => {
        let url = `${API_URL}/discussions/${courseId}`;
        if (moduleId) {
            url += `?moduleId=${moduleId}`;
        }
        const response = await axios.get(url, { headers: getAuthHeaders() });
        return response.data;
    },

    // Create a new discussion/question
    createDiscussion: async (courseId: string, data: { title: string, content: string, moduleId?: string, tags?: string[] }) => {
        const response = await axios.post(`${API_URL}/discussions/${courseId}`, data, { headers: getAuthHeaders() });
        return response.data;
    },

    // Add a reply to a discussion
    addReply: async (discussionId: string, content: string) => {
        const response = await axios.post(`${API_URL}/discussions/${discussionId}/reply`, { content }, { headers: getAuthHeaders() });
        return response.data;
    },

    // Resolve a discussion
    resolveDiscussion: async (discussionId: string) => {
        const response = await axios.put(`${API_URL}/discussions/${discussionId}/resolve`, {}, { headers: getAuthHeaders() });
        return response.data;
    }
};

// Course Reviews API Service
export const reviewService = {
    // Get all reviews for a course (Public accessible)
    getReviews: async (courseId: string) => {
        const response = await axios.get(`${API_URL}/courses/${courseId}/reviews`);
        return response.data;
    },

    // Add or update a review (Requires authentication/enrollment)
    addReview: async (courseId: string, data: { rating: number, comment?: string }) => {
        const response = await axios.post(`${API_URL}/courses/${courseId}/reviews`, data, { headers: getAuthHeaders() });
        return response.data;
    }
};
