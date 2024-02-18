import React, { useEffect, useState } from 'react';

function LoadingSpinner ({ delayTime }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, delayTime !== undefined ? delayTime : 1000);
        return () => {
            clearTimeout(showTimer);
        };
    }, [delayTime]);

    if (!isVisible) {
        return;
    }

    return (
        <div className='w-full flex justify-center'>
            <div
                className={
                    `border-8 border-white border-t-gray-400 w-10 h-10 animate-spin
                    rounded-full`
                }
            />
        </div>
    );
}

export default LoadingSpinner;
