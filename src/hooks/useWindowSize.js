import { useState, useEffect } from 'react';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        let timeoutId = null;

        const handleResize = () => {
            clearTimeout(timeoutId);
            // Debounce resize events for performance
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
};

export default useWindowSize;
