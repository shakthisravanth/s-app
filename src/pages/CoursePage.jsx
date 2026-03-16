import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Video, PlayCircle, Loader2, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../utils/apiHelper';
import useWindowSize from '../hooks/useWindowSize';

const CoursePage = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { width } = useWindowSize();
    
    const [course, setCourse] = useState(null);
    const [contents, setContents] = useState([]);
    const [activeContentId, setActiveContentId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [completedContentIds, setCompletedContentIds] = useState([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const loadProgress = async () => {
        try {
            const res = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/user/courses/${courseId}/progress`);
            if (res.ok) {
                const data = await res.json();
                setCompletedContentIds(data.completedContentIds || []);
            }
        } catch (err) {
            console.error("Failed to load progress", err);
        }
    };

    useEffect(() => {
        const loadCourseData = async () => {
            setIsLoading(true);
            try {
                // Fetch course details
                const courseRes = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/user/my-courses`);
                if (courseRes.ok) {
                    const courses = await courseRes.json();
                    const currentCourse = courses.find(c => c.id.toString() === courseId);
                    if (currentCourse) setCourse(currentCourse);
                }

                // Fetch course contents
                const contentRes = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/admin/courses/${courseId}/content`);
                if (contentRes.ok) {
                    const data = await contentRes.json();
                    setContents(data);
                    if (data.length > 0) {
                        setActiveContentId(data[0].id);
                    }
                }

                // Fetch progress
                await loadProgress();
            } catch (err) {
                console.error("Failed to load course data", err);
                toast.error("Failed to load course content");
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) loadCourseData();
    }, [courseId]);

    const handleMarkAsComplete = async () => {
        if (!activeContentId) return;

        setIsCompleting(true);
        try {
            const res = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/user/courses/${courseId}/content/${activeContentId}/complete`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success("Great job! Learning part completed.");
                await loadProgress();
            } else {
                toast.error("Failed to mark as complete");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsCompleting(false);
            setShowConfirmModal(false);
        }
    };

    const handleUndo = async () => {
        if (!activeContentId) return;
        setIsUndoing(true);
        try {
            const res = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/user/courses/${courseId}/content/${activeContentId}/undo`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Progress reversed");
                await loadProgress();
            } else {
                toast.error("Failed to undo progress");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsUndoing(false);
        }
    };

    const handleRestart = async () => {
        if (!window.confirm("Are you sure you want to restart the course? All your progress will be cleared.")) return;
        setIsRestarting(true);
        try {
            const res = await fetchWithAuth(`https://incred-demo-production.up.railway.app/api/user/courses/${courseId}/restart`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success("Course restarted!");
                await loadProgress();
            } else {
                toast.error("Failed to restart course");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsRestarting(false);
        }
    };

    const activeContent = contents.find(c => c.id === activeContentId);
    const isCurrentCompleted = completedContentIds.includes(activeContentId);

    // Embed YouTube link helper
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        try {
            if (url.includes('youtube.com/watch')) {
                videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            return url; // fallback
        } catch (e) {
            return url;
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050614', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <>
        <div style={{ minHeight: '100vh', background: '#050614', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', overflowX: 'hidden' }}>

            {/* Background Decorative Elements */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Header matching MyLearnings layout */}
                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '3rem 2rem 0', display: 'flex', flexDirection: width < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: width < 768 ? 'flex-start' : 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/my-learnings')}
                        style={{ background: 'none', border: 'none', color: '#888', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', transition: 'color 0.3s', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >
                        <ArrowLeft size={16} /> Back to my learnings
                    </button>
                    <h1 style={{ margin: 0, fontSize: width < 768 ? '2rem' : '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-1px', textAlign: width < 768 ? 'left' : 'right' }}>
                        {course?.name || 'Course Curriculum'}
                    </h1>
                </div>

                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: width < 1024 ? 'column' : 'row', gap: '2rem' }}>
                    
                    {/* LEFT SIDEBAR: Curriculum */}
                    <div style={{ width: width < 1024 ? '100%' : '380px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: width < 768 ? '1.5rem' : '2rem', height: width < 1024 ? 'auto' : 'calc(100vh - 180px)', maxHeight: width < 1024 ? '50vh' : 'none', position: width < 1024 ? 'static' : 'sticky', top: '40px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Curriculum</h2>
                        <p style={{ margin: '0 0 2rem 0', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {contents.length} {contents.length === 1 ? 'Lesson' : 'Lessons'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {contents.map((content) => (
                                <motion.div 
                                    key={content.id}
                                    whileHover={{ scale: activeContentId === content.id ? 1 : 1.02, x: activeContentId === content.id ? 0 : 4 }}
                                    onClick={() => setActiveContentId(content.id)}
                                    style={{ 
                                        background: activeContentId === content.id ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(192, 132, 252, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${activeContentId === content.id ? 'rgba(129, 140, 248, 0.5)' : 'rgba(255,255,255,0.05)'}`,
                                        borderRadius: '16px',
                                        padding: '1.2rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {activeContentId === content.id && (
                                        <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #818cf8, #c084fc)' }}></div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 0.5rem 0' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: activeContentId === content.id ? '#fff' : '#cbd5e1', fontWeight: 600, flex: 1 }}>
                                            {content.title}
                                        </h4>
                                        {completedContentIds.includes(content.id) && (
                                            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                        )}
                                    </div>
                                    {activeContentId === content.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', width: 'fit-content', fontWeight: 700 }}>
                                            <PlayCircle size={14} /> Playing
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                                            <Video size={14} /> Video Lesson
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {contents.length === 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#64748b', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    No curriculum has been added to this course yet.
                                </div>
                            )}
                        </div>

                        {contents.length > 0 && (
                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRestart}
                                    disabled={isRestarting}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                                >
                                    {isRestarting ? (
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <AlertTriangle size={16} />
                                    )}
                                    Restart Course
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT MAIN CONTENT: Player and Details */}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: width < 768 ? '1.5rem' : '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        {activeContent ? (
                            <>
                                {/* Player Header Tag */}
                                <div style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '0.6rem 1.2rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '2rem', fontSize: '0.9rem', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                    <Video size={16} /> Now Playing: {activeContent.title}
                                </div>

                                {/* Video Player Area */}
                                {activeContent.videoUrl ? (
                                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '24px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={getEmbedUrl(activeContent.videoUrl)} 
                                            title={activeContent.title}
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', color: '#64748b' }}>
                                        <Video size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                        <h3 style={{ margin: 0, color: '#e2e8f0' }}>No Video Provided</h3>
                                        <p style={{ margin: '0.5rem 0 0 0' }}>This lesson is text-based only.</p>
                                    </div>
                                )}

                                {/* Mark as Complete Button */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                                    {isCurrentCompleted && (
                                        <button
                                            onClick={handleUndo}
                                            disabled={isUndoing}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: '0.5rem' }}
                                        >
                                            {isUndoing ? "Processing..." : "Undo Completion"}
                                        </button>
                                    )}
                                    <motion.button
                                        whileHover={!isCurrentCompleted ? { scale: 1.02 } : {}}
                                        whileTap={!isCurrentCompleted ? { scale: 0.98 } : {}}
                                        disabled={isCurrentCompleted || isCompleting}
                                        onClick={() => setShowConfirmModal(true)}
                                        style={{
                                            background: isCurrentCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                            color: isCurrentCompleted ? '#10b981' : '#818cf8',
                                            border: `1px solid ${isCurrentCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(129, 140, 248, 0.3)'}`,
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            cursor: isCurrentCompleted ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            opacity: isCompleting ? 0.7 : 1
                                        }}
                                    >
                                        {isCompleting ? (
                                            <>
                                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                Processing...
                                            </>
                                        ) : isCurrentCompleted ? (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                Completed
                                            </>
                                        ) : (
                                            "Mark as Complete"
                                        )}
                                    </motion.button>
                                </div>

                                {/* Content Description */}
                                <div style={{ marginBottom: '3.5rem' }}>
                                    <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>About this lesson</h3>
                                    <div style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        {activeContent.textContent}
                                    </div>
                                </div>

                                {/* Notes Button */}
                                {activeContent.notesUrl && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
                                        <p style={{ color: '#888', marginBottom: '1rem', fontWeight: 500 }}>Additional Resources</p>
                                        <motion.button 
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => window.open(activeContent.notesUrl, '_blank')}
                                            style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', color: '#fff', border: 'none', padding: '1.2rem 2.5rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 20px rgba(129, 140, 248, 0.3)' }}
                                        >
                                            <ExternalLink size={20} /> View Class Notes
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: '#64748b' }}>
                                <Video size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                                <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.5rem' }}>Ready to Learn?</h3>
                                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Select a lesson from the curriculum to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ background: '#0a0b1e', border: '1px solid rgba(129, 140, 248, 0.2)', borderRadius: '32px', padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        >
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#818cf8' }}>
                                <AlertTriangle size={40} />
                            </div>
                            
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Confirm Completion</h2>
                            <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                Are you sure you have completed this learning part? This will update your progress for <span style={{ color: '#fff', fontWeight: 600 }}>{activeContent?.title}</span>.
                            </p>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleMarkAsComplete}
                                    disabled={isCompleting}
                                    style={{ flex: 1, background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', color: '#fff', border: 'none', padding: '1.2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(129, 140, 248, 0.3)' }}
                                >
                                    {isCompleting ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Loader2 size={18} />
                                        </motion.div>
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    Yes, I'm Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
        </>
    );
};

export default CoursePage;
