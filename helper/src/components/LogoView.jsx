import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import logoStandard from '../assets/images/logo-standard.svg';
import logoWhite from '../assets/images/logo-white.svg';

const LogoView = ({ doFadeOut, settings }) => {
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

    const logo = settings.theme === 'white1' || settings.color5?.toLowerCase() === 'ffffff'
        ? logoStandard
        : logoWhite;

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
