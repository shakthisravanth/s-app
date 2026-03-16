import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Search, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../utils/apiHelper';
import useWindowSize from '../hooks/useWindowSize';

const MyLearnings = () => {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWithAuth('https://incred-demo-production.up.railway.app/api/user/my-courses');
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } else {
                toast.error('Failed to load your courses');
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Could not connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#050614', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: width < 768 ? '2rem 1.5rem' : '4rem' }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <header style={{ marginBottom: '4rem', display: 'flex', flexDirection: width < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: width < 768 ? 'flex-start' : 'flex-end', gap: '2rem' }}>
                    <div>
                        <button 
                            onClick={() => navigate('/student-dashboard')}
                            style={{ background: 'none', border: 'none', color: '#888', padding: 0, marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', transition: 'color 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = '#888'}
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: width < 768 ? '2.5rem' : '3.5rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}
                        >
                            My <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learnings</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ color: '#888', fontSize: '1.1rem', marginTop: '1rem', maxWidth: '500px' }}>
                            Continue where you left off. Everything you need to succeed is right here.
                        </motion.p>
                    </div>

                    {/* Search */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ position: 'relative', width: width < 768 ? '100%' : '350px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input 
                            type="text" 
                            placeholder="Find a course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem 1.5rem 1rem 3.5rem', borderRadius: '16px', width: '100%', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                            onFocus={e => e.currentTarget.style.borderColor = '#818cf8'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </motion.div>
                </header>

                {/* Course Grid */}
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: '#888' }}>
                        <Loader2 size={48} className="spin" style={{ color: '#818cf8', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
                        <p>Loading your courses...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredCourses.map((course, index) => (
                            <motion.div 
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                style={{ 
                                    background: '#0a0b10', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    borderRadius: '24px', 
                                    padding: '2rem', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #818cf8, #c084fc)' }}></div>
                                
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(129, 140, 248, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#818cf8' }}>
                                    <BookOpen size={24} />
                                </div>
                                
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>{course.name}</h3>
                                <p style={{ color: '#888', fontSize: '1rem', margin: '0 0 1.5rem 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {course.description || 'For Beginners'}
                                </p>
                                
                                {/* Progress Bar */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>Progress</span>
                                        <span style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 700 }}>{course.progress || 0}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${course.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #818cf8, #c084fc)', borderRadius: '999px', transition: 'width 1s ease-out' }}></div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button 
                                        onClick={() => navigate(`/course/${course.id}`)}
                                        style={{ 
                                            width: '100%',
                                            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', 
                                            color: '#fff', 
                                            border: 'none', 
                                            padding: '1rem', 
                                            borderRadius: '12px', 
                                            fontSize: '1.05rem', 
                                            fontWeight: 700, 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            boxShadow: '0 10px 20px rgba(129, 140, 248, 0.2)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Play size={18} fill="currentColor" /> Start Learning
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px' }}>
                        <BookOpen size={64} style={{ color: '#333', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.8rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>No courses found</h3>
                        <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                            {searchQuery ? "We couldn't find any courses matching your search." : "You haven't been assigned any courses yet. Check back later!"}
                        </p>
                    </div>
                )}
            </div>
            
            <style jsx="true">{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MyLearnings;
