import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';

const IntroAnimation = () => {
    const [step, setStep] = React.useState(() => {
        // Use try-catch for mobile browser compatibility
        try {
            return sessionStorage.getItem('intro_played') ? 3 : 1;
        } catch (e) {
            // Fallback if sessionStorage is not available
            return 1;
        }
    });
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const navigate = useNavigate();

    // Check if user is already logged in - run immediately on mount
    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            
            if (token && role === 'STUDENT') {
                // User is already authenticated, redirect immediately
                navigate('/student-dashboard', { replace: true });
                return;
            }
        } catch (e) {
            // Handle localStorage errors gracefully
            console.error('Storage access error:', e);
        }
    }, [navigate]);

    useEffect(() => {
        if (step === 3) return;

        const timer1 = setTimeout(() => setStep(2), 3000); // 3s for "Welcome"
        const timer2 = setTimeout(() => {
            setStep(3);
            try {
                sessionStorage.setItem('intro_played', 'true');
            } catch (e) {
                console.error('Failed to save intro_played:', e);
            }
        }, 8500); // 5.5s for name reveal

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [step]);

    const name = "Shakthi Sravanth";
    const nameChars = Array.from(name);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 * i },
        }),
    };

    const childVariants = {
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 50,
            scale: 2,
        },
    };

    return (
        <div className="intro-container">
            <AnimatePresence mode='wait'>
                {step === 1 && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="intro-text"
                    >
                        <h1 style={{ fontSize: '2rem', color: 'var(--text-muted)', fontWeight: 400 }}>Welcome to</h1>
                        <h1 className="brand-name">Incredible Learning</h1>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div
                        key="name"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -100, filter: "blur(20px)", transition: { duration: 0.8 } }}
                        className="intro-text"
                    >
                        <h2 className="creator-name">
                            {nameChars.map((char, index) => (
                                <motion.span
                                    key={index}
                                    variants={childVariants}
                                    className="char"
                                    style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </h2>
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        <Login isEmbedded={true} defaultRole="student" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IntroAnimation;
