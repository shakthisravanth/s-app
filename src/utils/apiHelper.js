// Centralized fetch wrapper with automatic token expiry detection
import toast from 'react-hot-toast';

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    try {
        const response = await fetch(url, { ...options, headers });
        return response;
    } catch (error) {
        // Network error
        if (!navigator.onLine || error.name === 'TypeError') {
            toast.error('Network error. Please check your connection.');
        }
        throw error;
    }
};

// Validation helpers
export const validators = {
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email is required';
        if (!regex.test(value)) return 'Enter a valid email address';
        return null;
    },
    phone: (value) => {
        const regex = /^\d{10}$/;
        if (!value) return 'Phone number is required';
        if (!regex.test(value.replace(/[\s-]/g, ''))) return 'Enter a valid 10-digit phone number';
        return null;
    },
    name: (value) => {
        if (!value || value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
    },
    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Must include at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Must include at least one number';
        return null;
    }
};
