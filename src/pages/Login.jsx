import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { validators } from '../utils/apiHelper';

const Login = ({ isEmbedded = false, defaultRole = 'student' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log('Login attempt started', { email, password: '***' });

        // Email validation
        const emailError = validators.email(email);
        if (emailError) {
            console.error('Email validation failed:', emailError);
            setError(emailError);
            toast.error(emailError);
            return;
        }

        // Prevent double submission on mobile (tap vs click issues)
        if (isLoading) {
            console.log('Already loading, preventing duplicate submission');
            return;
        }
        
        setIsLoading(true);

        try {
            console.log('Sending login request...');
            
            // Check if online before making request
            if (!navigator.onLine) {
                throw new Error('No internet connection. Please check your network.');
            }
            
            // Use environment variable for API URL (works in both development and production)
            const apiUrl = import.meta.env.VITE_API_URL 
                ? `${import.meta.env.VITE_API_URL}/api/auth/login`
                : '/api/auth/login'; // Fallback to proxy in dev
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            console.log('Fetching from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal,
                // Add mode cors explicitly
                mode: 'cors',
                credentials: 'omit'
            });
            
            clearTimeout(timeoutId);

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Login failed:', errorData);
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data = await response.json();
            console.log('Login successful, role:', data.role);

            // Critical Role Check
            if (data.role === 'ADMIN') {
                toast.error('Admin access detected. Please use the Admin Portal.');
                setIsLoading(false);
                return;
            }

            // Store authentication data persistently with error handling
            try {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.name);
                console.log('Auth data saved to localStorage');
            } catch (storageErr) {
                console.error('Failed to save auth data:', storageErr);
                toast.error('Failed to save session. Please allow cookies/storage.');
                setIsLoading(false);
                return;
            }

            toast.success(`Welcome back, ${data.name}!`);
            
            // Use replace to prevent back button issues on mobile
            console.log('Navigating to dashboard...');
            navigate('/student-dashboard', { replace: true });
        } catch (err) {
            // Handle timeout errors
            if (err.name === 'AbortError') {
                console.error('Request timed out');
                toast.error('Request timed out. Please check your connection and try again.');
                setError('Connection timeout. Please try again.');
            } else if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
                // Network/CORS error - provide more specific guidance
                console.error('Network/CORS error:', err);
                
                // Check if it's a mixed content error
                if (window.location.protocol === 'http:' && !window.isSecureContext) {
                    console.warn('Possible mixed content issue. Try using HTTPS or ensure the API allows HTTP connections.');
                }
                
                // Provide actionable error message
                const errorMsg = 'Unable to connect to server. This might be a CORS issue. Please contact support with this error.';
                toast.error(errorMsg);
                setError(errorMsg + ' (Check browser console for details)');
            } else {
                console.error('Login error:', err.message);
                toast.error(err.message || 'Login failed');
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginCard = (
        <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in as {defaultRole === 'admin' ? 'Administrator' : 'Student'} to continue</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="enter registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingRight: '3rem' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#ff4444', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(255,68,68,0.2)' }}
                    >
                        {error}
                    </motion.div>
                )}
                <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Sign In'}
                </button>
                <div className="help-text">
                    <p>
                        Forgot your password? <span className="help-link">Kindly contact admin</span>
                    </p>
                </div>
            </form>
        </motion.div>
    );

    if (isEmbedded) return loginCard;

    return (
        <div className="auth-container">
            {loginCard}
        </div>
    );
};

export default Login;
