import api from './api';

const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            
            if (response.data) {
                // Store user and token in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },



    register: async (userData, endpoint = '/users/register/client') => {
        try {
            const response = await api.post(endpoint, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },



    /*register: async (userData) => {
        try {
            const response = await api.post('/users/register/client', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },*/

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    }
};

export default authService;