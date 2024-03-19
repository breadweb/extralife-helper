import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import logo from '../assets/images/extra-life-logo.svg';

const LogoView = ({ doFadeOut }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!doFadeOut) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsVisible(false);
        }, import.meta.env.VITE_LOGO_TTL - 800);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [doFadeOut]);

    return (
        <img
            src={logo}
            className={
                classNames(
                    'animate-delay-[.5s]',
                    isVisible ? 'animate-fade-in' : 'animate-fade-out',
                )
            }
            alt='Extra Life'
        />
    );
};

export default React.memo(LogoView);
