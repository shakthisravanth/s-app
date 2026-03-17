import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Play, Trophy, Code, MessageSquare, Terminal, RefreshCw, X, LogOut, CheckCircle, Clock, Settings, Lock, Eye, EyeOff, Trash2, ChevronDown, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import toast from 'react-hot-toast';
import { fetchWithAuth, validators, handleLogout } from '../utils/apiHelper';
import useWindowSize from '../hooks/useWindowSize';

const StudentDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get('view');

    // Derived state from URL parameters
    const showPasswordModal = currentView === 'settings';
    const showCompiler = currentView === 'compiler';

    const setViewMode = (view) => {
        if (view) {
            setSearchParams({ view });
        } else {
            setSearchParams({});
        }
    };

    const { width } = useWindowSize();

    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Compiler State
    const [selectedLang, setSelectedLang] = useState('java');
    const [isExecuting, setIsExecuting] = useState(false);
    const [output, setOutput] = useState('');
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [stdin, setStdin] = useState('');

    const userName = localStorage.getItem('name') || 'Student';

    const boilerplates = {
        java: "/* Welcome to Incredible compiler */\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Welcome to Incredible ground!\");\n        System.out.println(\"Let's build something amazing today.\");\n    }\n}",
        python: "# Welcome to Incredible compiler\n\ndef welcome():\n    print(\"Welcome to Incredible ground!\")\n    print(\"Let's build something amazing today.\")\n\nwelcome()",
        javascript: "// Welcome to Incredible compiler\n\nconst welcome = () => {\n    console.log(\"Welcome to Incredible ground!\");\n    console.log(\"Let's build something amazing today.\");\n};\n\nwelcome();"
    };

    const [code, setCode] = useState(boilerplates.java);

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput('Connecting to secure execution engine...\n');

        try {
            // Judge0 Language IDs: JS (63), Python (71), Java (62)
            const langIdMap = { javascript: 63, python: 71, java: 62 };

            const normalizedInput = stdin ? (stdin.endsWith('\n') ? stdin : `${stdin}\n`) : '';

            const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_code: code,
                    language_id: langIdMap[selectedLang],
                    stdin: normalizedInput
                })
            });

            const data = await response.json();

            if (data.stdout || data.stderr || data.compile_output) {
                let finalOutput = '';
                if (data.stdout) finalOutput += data.stdout;
                if (data.stderr) finalOutput += `\nError:\n${data.stderr}`;
                if (data.compile_output) finalOutput += `\nCompile Error:\n${data.compile_output}`;
                setOutput(finalOutput || 'Execution finished (no output).');
            } else if (data.status && data.status.description) {
                setOutput(`Status: ${data.status.description}`);
            } else {
                setOutput('Error: Execution failed.');
            }
        } catch (err) {
            setOutput('Network Error: Unable to reach compiler service.');
            toast.error('Unable to reach compiler service');
        } finally {
            setIsExecuting(false);
        }
    };

    // Fetch real stats
    const [coursesCount, setCoursesCount] = useState(0);

    const fetchStudentDetails = async () => {
        try {
            const response = await fetchWithAuth('https://incred-demo-production.up.railway.app/api/user/my-courses');
            if (response.ok) {
                const data = await response.json();
                setCoursesCount(data.length);
            }
        } catch (err) {
            console.error("Failed to fetch student courses", err);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        // Validate password strength
        const passError = validators.password(passwordData.newPassword);
        if (passError) {
            setMessage({ type: 'error', text: passError });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetchWithAuth('https://incred-demo-production.up.railway.app/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to change password');
            }

            toast.success('Password changed successfully!');
            setTimeout(() => {
                setViewMode(null);
                setMessage({ type: '', text: '' });
                setPasswordData({ oldPassword: '', newPassword: '' });
            }, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#050614', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)', zSelf: -1 }}></div>
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)', zSelf: -1 }}></div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 4rem' }}>
                {/* Header Section */}
                <header
                    style={{
                        marginBottom: width < 768 ? '3rem' : '5rem',
                        paddingTop: '2rem'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Top row: status + actions */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                            >
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}></div>
                                <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    Online • Student Portal
                                </span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                style={{ display: 'flex', gap: '0.75rem' }}
                            >
                                <button
                                    onClick={() => setViewMode('settings')}
                                    className="nav-action-btn"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        padding: '0.75rem 1.3rem',
                                        borderRadius: '999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Settings size={18} /> <span>Settings</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                    }}
                                    className="nav-action-btn logout"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)',
                                        border: 'none',
                                        color: '#000',
                                        fontWeight: 700,
                                        padding: '0.75rem 1.3rem',
                                        borderRadius: '999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 18px rgba(255, 78, 80, 0.3)'
                                    }}
                                >
                                    <LogOut size={18} /> <span>Logout</span>
                                </button>
                            </motion.div>
                        </div>

                        {/* Hero text */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                        >
                            <h1
                                style={{
                                    fontSize: width < 768 ? '2.4rem' : '3.6rem',
                                    fontWeight: 800,
                                    margin: 0,
                                    letterSpacing: '-2px',
                                    lineHeight: 1.1
                                }}
                            >
                                Welcome back,{` `}
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    {userName}
                                </span>
                                !
                            </h1>
                            <p
                                style={{
                                    color: '#888',
                                    fontSize: '1rem',
                                    marginTop: '1.1rem',
                                    maxWidth: '520px',
                                    lineHeight: '1.6'
                                }}
                            >
                                Ready to continue your journey? You have <span style={{ color: '#fff' }}>{coursesCount} {coursesCount === 1 ? 'course' : 'courses'}</span> waiting today.
                            </p>
                        </motion.div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div
                    className="dashboard-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: width < 1024 ? '1fr' : 'repeat(12, 1fr)',
                        gap: '2.5rem'
                    }}
                >

                    {/* Progress Overview Card (My Learnings) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => window.location.href = '/my-learnings'}
                        style={{
                            gridColumn: width < 1024 ? 'auto' : 'span 8',
                            padding: width < 768 ? '2.5rem' : '4rem',
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(192, 132, 252, 0.05) 100%)',
                            border: '1px solid rgba(129, 140, 248, 0.3)',
                            borderRadius: '32px',
                            backdropFilter: 'blur(30px)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)'; }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: 'linear-gradient(to bottom, #818cf8, #c084fc)' }}></div>

                        <div style={{ display: 'flex', flexDirection: width < 640 ? 'column' : 'row', justifyContent: 'space-between', alignItems: width < 640 ? 'flex-start' : 'center', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: width < 768 ? '2rem' : '3rem', margin: '0 0 1rem 0', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Learnings</h3>
                                <p style={{ color: '#aaa', fontSize: '1.2rem', margin: '0 0 1.5rem 0' }}>Access your personalized curriculum.</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '16px', width: 'fit-content' }}>
                                    <BookOpen size={24} style={{ color: '#818cf8' }} />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>{coursesCount} Active {coursesCount === 1 ? 'Program' : 'Programs'}</span>
                                </div>
                            </div>

                            <div style={{ background: '#fff', color: '#000', padding: '1.2rem 2.5rem', borderRadius: '999px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(129,140,248,0.2)' }}>
                                Continue Learning <ChevronRight size={20} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            gridColumn: width < 1024 ? 'auto' : 'span 4',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}
                    >
                        <div style={{ padding: '2rem', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', borderRadius: '24px' }}>
                            <CheckCircle size={32} style={{ color: '#818cf8', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>12</div>
                            <div style={{ color: '#818cf8', fontWeight: 600 }}>Certificates Earned</div>
                        </div>
                        <div style={{ padding: '2rem', background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '24px' }}>
                            <Lock size={32} style={{ color: '#c084fc', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>240h</div>
                            <div style={{ color: '#c084fc', fontWeight: 600 }}>Total Study Time</div>
                        </div>

                        {/* Compiler Entry Card */}
                        <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            onClick={() => setViewMode('compiler')}
                            style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                                <Code size={80} />
                            </div>
                            <Code size={32} style={{ color: '#818cf8', marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0', fontWeight: 700 }}>Incredible ground</h3>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Practice Java, Python & JS with our instant compiler.</p>
                        </motion.div>
                    </motion.div>

                </div>
            </div>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#0e1025', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '40px', width: '100%', maxWidth: '480px', padding: '3.5rem', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                            <button onClick={() => setViewMode(null)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <div style={{ width: '64px', height: '64px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.8rem', color: '#818cf8' }}>
                                    <Lock size={32} />
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Account Security</h2>
                                <p style={{ color: '#888', marginTop: '0.8rem' }}>Protect your learning progress</p>
                            </div>

                            {message.text && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', fontSize: '0.95rem', textAlign: 'center', background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#4ade80' : '#f87171', border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                                    {message.text}
                                </motion.div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div style={{ marginBottom: '1.8rem' }}>
                                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            required
                                            className="form-input"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.1rem 1.5rem', width: '100%', color: '#fff', fontSize: '1rem' }}
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        />
                                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '3rem' }}>
                                    <label style={{ display: 'block', color: '#ccc', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>New Secure Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            className="form-input"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.1rem 1.5rem', width: '100%', color: '#fff', fontSize: '1rem' }}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="login-btn" style={{ margin: 0, padding: '1.2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700 }} disabled={isLoading}>
                                    {isLoading ? 'Encrypting...' : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Compiler Modal */}
            <AnimatePresence>
                {showCompiler && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 3, 10, 0.98)', zIndex: 2000, display: 'flex', flexDirection: 'column', userSelect: 'auto', WebkitUserSelect: 'auto' }}>
                        {/* IDE Header */}
                        <div style={{
                            display: 'flex',
                            flexDirection: width < 768 ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: width < 768 ? 'flex-start' : 'center',
                            padding: width < 480 ? '1rem' : '1.5rem 2.5rem',
                            gap: '1rem',
                            background: '#15172b',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#818cf8', padding: '0.4rem', borderRadius: '8px' }}>
                                        <Code size={18} color="#000" />
                                    </div>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>Incredible ground</h2>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#818cf8',
                                            border: '1px solid rgba(129, 140, 248, 0.2)',
                                            borderRadius: '10px',
                                            padding: '0.5rem 1.2rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            minWidth: '120px',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <span style={{ textTransform: 'capitalize' }}>{selectedLang}</span>
                                        <ChevronDown size={14} style={{ transform: showLangDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                                    </button>

                                    <AnimatePresence>
                                        {showLangDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 8px)',
                                                    left: 0,
                                                    right: 0,
                                                    background: 'rgba(21, 23, 43, 0.95)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    padding: '0.5rem',
                                                    zIndex: 100,
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {['java', 'python', 'javascript'].map(lang => (
                                                    <div
                                                        key={lang}
                                                        onClick={() => {
                                                            setSelectedLang(lang);
                                                            setCode(boilerplates[lang]);
                                                            setShowLangDropdown(false);
                                                        }}
                                                        style={{
                                                            padding: '0.7rem 1rem',
                                                            borderRadius: '8px',
                                                            color: selectedLang === lang ? '#818cf8' : '#94a3b8',
                                                            background: selectedLang === lang ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            textTransform: 'capitalize',
                                                            transition: 'all 0.2s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (selectedLang !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (selectedLang !== lang) e.currentTarget.style.background = 'transparent';
                                                        }}
                                                    >
                                                        {lang}
                                                        {selectedLang === lang && <CheckCircle size={14} />}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: width < 768 ? '100%' : 'auto', justifyContent: 'space-between' }}>
                                <button
                                    onClick={handleRunCode}
                                    disabled={isExecuting}
                                    style={{ flex: window.innerWidth < 768 ? 1 : 'none', background: '#818cf8', border: 'none', color: '#fff', padding: '0.5rem 1.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.2)' }}
                                >
                                    {isExecuting ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
                                    Run
                                </button>
                                <button
                                    onClick={() => setViewMode(null)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* IDE Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: width < 1024 ? 'column' : 'row', overflow: 'hidden' }}>
                            {/* Editor Area */}
                            <div style={{
                                flex: 1,
                                position: 'relative',
                                background: '#0f111a',
                                borderRight: width < 1024 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                borderBottom: width < 1024 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                overflow: 'auto'
                            }}>
                                <div style={{ display: 'flex', minHeight: '100%' }}>
                                    {/* Line Numbers */}
                                    <div style={{
                                        padding: '20px 0',
                                        width: '50px',
                                        textAlign: 'center',
                                        background: '#0a0c14',
                                        color: '#4b5563',
                                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                        fontSize: width < 768 ? '0.9rem' : '1.1rem',
                                        lineHeight: '2.2',
                                        userSelect: 'none',
                                        borderRight: '1px solid rgba(255,255,255,0.05)',
                                        flexShrink: 0
                                    }}>
                                        {code.split('\n').map((_, i) => (
                                            <div key={i} style={{ height: '2.2em' }}>{i + 1}</div>
                                        ))}
                                    </div>

                                    <div style={{ flex: 1, overflow: 'visible' }}>
                                        <Editor
                                            value={code}
                                            onValueChange={code => setCode(code)}
                                            highlight={code => Prism.highlight(code, Prism.languages[selectedLang] || Prism.languages.javascript, selectedLang)}
                                            padding={20}
                                            style={{
                                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                                fontSize: width < 768 ? '0.9rem' : '1.1rem',
                                                backgroundColor: 'transparent',
                                                minHeight: '100%',
                                                lineHeight: '2.2',
                                                color: '#abb2bf'
                                            }}
                                            className="code-editor"
                                            textareaId="code-playground-editor"
                                            textareaClassName="code-editor-textarea"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Console & Input Area */}
                            <div style={{ width: width < 1024 ? '100%' : '460px', height: width < 1024 ? '280px' : 'auto', background: '#02030a', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(15,23,42,0.9)' }}>
                                {/* Tabs / Header */}
                                <div style={{ padding: '0.5rem 1rem', background: '#050816', borderBottom: '1px solid rgba(15,23,42,0.9)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Terminal size={14} style={{ color: '#e5e7eb' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e5e7eb' }}>Console</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>•</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>Program Input</span>
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <button onClick={() => { setOutput(''); setStdin(''); }} style={{ background: 'rgba(15,23,42,0.9)', borderRadius: '999px', border: '1px solid rgba(31,41,55,0.9)', color: '#9ca3af', cursor: 'pointer', padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
                                            Clear all
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Output */}
                                    <div style={{ flex: 1, padding: '0.75rem 1rem', overflowY: 'auto', fontFamily: "'Fira Code', monospace", fontSize: '0.8rem', lineHeight: '1.6', background: 'radial-gradient(circle at top left, rgba(37,99,235,0.14), transparent 55%)' }}>
                                        <pre style={{ margin: 0, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                                            {output || <span style={{ color: '#4b5563' }}>{'>'} Program output will appear here…</span>}
                                        </pre>
                                    </div>

                                    {/* Input */}
                                    <div style={{ borderTop: '1px solid rgba(15,23,42,0.9)', padding: '0.75rem 1rem', background: 'linear-gradient(to top, #020617, #020617ee)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', fontWeight: 600 }}>
                                                Program Input (stdin)
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>
                                                Press <span style={{ color: '#9ca3af' }}>Run</span> to execute with this input
                                            </span>
                                        </div>
                                        <textarea
                                            value={stdin}
                                            onChange={(e) => setStdin(e.target.value)}
                                            placeholder="Example:&#10;23&#10;45  (multiple values on new lines)"
                                            style={{
                                                width: '100%',
                                                minHeight: '64px',
                                                maxHeight: '110px',
                                                resize: 'vertical',
                                                background: '#020617',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(55,65,81,0.9)',
                                                padding: '0.55rem 0.7rem',
                                                fontFamily: "'Fira Code', monospace",
                                                fontSize: '0.8rem',
                                                color: '#e5e7eb',
                                                outline: 'none',
                                                boxShadow: '0 0 0 1px rgba(15,23,42,0.9)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
