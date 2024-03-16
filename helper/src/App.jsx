import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import colorConvert from 'color-convert';
import confetti from './modules/confetti';
import ContentManager from './components/ContentManager';
import logger from './modules/logger';
import React from 'react';
import transparencyGrid from './assets/images/transparency-grid.png';
import useHelperSettings from './hooks/useHelperSettings';

const App = () => {
    const { i18n } = useTranslation();
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [contentScale, setContentScale] = useState(1);
    const helperSettings = useHelperSettings();

    useEffect(() => {
        const onKeyPress = evt => {
            switch (evt.key) {
                case 'c':
                    confetti.start();
                    break;
                default:
                    // Do nothing.
            }
        };

        if (['DEV', 'LOCAL'].includes(import.meta.env.VITE_RUNTIME_MODE)) {
            document.addEventListener('keypress', onKeyPress);
        }

        return () => {
            document.removeEventListener('keypress', onKeyPress);
        };
    }, []);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }
    }, [helperSettings.error]);

    useEffect(() => {
        if (helperSettings?.data === undefined) {
            return;
        }

        if (i18n.language !== helperSettings.data.lang) {
            logger.debug(`Changing language from ${i18n.language} to ${helperSettings.data.lang}...`);
            i18n.changeLanguage(helperSettings.data.lang);
        }

        if (!document.documentElement.classList.contains(helperSettings.data.theme)) {
            if (helperSettings.data.theme === 'custom') {
                logger.debug('Overriding theme colors with custom values...');
                for (let i = 1; i < 6; i++) {
                    const color = colorConvert.hex.hsl(helperSettings.data[`color${i}`]);
                    document.documentElement.style.setProperty(
                        `--twc-helper${i}`,
                        `${color[0]} ${color[1]}% ${color[2]}%`,
                    );
                }
            }

            logger.debug('Applying theme...');
            document.documentElement.classList.add(helperSettings.data.theme);
        }
    }, [helperSettings.data, helperSettings.error, i18n]);

    useEffect(() => {
        const getScale = () => {
            return window.innerWidth / import.meta.env.VITE_CONTENT_WIDTH;
        };

        const onWindowResize = () => {
            setContentScale(getScale());
        };

        setContentScale(getScale());

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    // If running in development mode and transparent background setting is enabled, show a transparency
    // grid background image to help visualize how elements will look against a transparent background.
    let containerStyle;
    if (import.meta.env.VITE_RUNTIME_MODE === 'DEV' && helperSettings.data?.isBackgroundTransparent) {
        containerStyle = {
            backgroundImage: `url(${transparencyGrid})`,
            backgroundRepeat: 'repeat',
        };
    }

    return (
        <div
            className={
                classNames(
                    'w-full h-screen flex flex-col items-center justify-center overflow-hidden',
                    helperSettings.data?.border === 'square' ? 'border-2 border-helper1' : '',
                    helperSettings.data?.border === 'rounded' ? 'border-2 border-helper1 rounded' : '',
                    helperSettings.data?.isBackgroundTransparent ? 'bg-none' : 'bg-helper5',
                )
            }
            style={containerStyle}
        >
            <div
                className='flex justify-center'
                style={
                    {
                        transform: `scale(${contentScale})`,
                        width: `${import.meta.env.VITE_CONTENT_WIDTH}px`,
                        height: `${import.meta.env.VITE_CONTENT_HEIGHT}px`,
                    }
                }
            >
                <ContentManager
                    settings={helperSettings.data}
                    errorMessage={errorMessage}
                />
            </div>
        </div>
    );
};

export default App;
