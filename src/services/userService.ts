import api, { API_URL } from '@/lib/api';

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

export const userService = {
    /**
     * Update user profile (name, bio, topic)
     */
    updateProfile: async (data: { name?: string; bio?: string; topic?: string; email?: string }) => {
        const response = await api.put(
            `/users/profile`,
            data
        );
        return response.data;
    },

    /**
     * Upload user avatar
     */
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post(
            `/users/avatar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    /**
     * Update password
     */
    updatePassword: async (currentPassword: string, newPassword: string) => {
        const response = await api.put(
            `/users/password`,
            { currentPassword, newPassword }
        );
        return response.data;
    },

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: async (preferences: {
        courseUpdates?: boolean;
        assignmentDeadlines?: boolean;
        newMessages?: boolean;
        weeklyDigest?: boolean;
    }) => {
        const response = await api.put(
            `/users/notifications`,
            preferences
        );
        return response.data;
    },

    /**
     * Get notification preferences
     */
    getNotificationPreferences: async () => {
        const response = await api.get(
            `/users/notifications`
        );
        return response.data;
    }
};
