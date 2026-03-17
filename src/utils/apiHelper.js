// Centralized fetch wrapper with automatic token expiry detection
import toast from 'react-hot-toast';

// Logout helper function - clears storage and redirects to home
export const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    toast.success('Logged out successfully');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
};

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
        
        // Handle token expiration (401 Unauthorized)
        if (response.status === 401) {
            // Token has expired or is invalid
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            toast.error('Session expired. Please login again.');
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            throw new Error('Session expired');
        }
        
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
