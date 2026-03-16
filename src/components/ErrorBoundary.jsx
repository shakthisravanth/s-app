import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#050614',
                    color: '#fff',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    padding: '2rem'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            margin: '0 auto 2rem', fontSize: '2rem'
                        }}>
                            ⚠️
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            An unexpected error occurred. Please try reloading the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                                border: 'none', color: '#fff', padding: '1rem 2.5rem',
                                borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                                cursor: 'pointer', boxShadow: '0 10px 30px rgba(129, 140, 248, 0.3)'
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
