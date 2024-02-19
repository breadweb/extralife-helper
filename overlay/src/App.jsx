import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import alertSfx from './assets/audio/alert.mp3';
import classNames from 'classnames';
import colorConvert from 'color-convert';
import ErrorView from './components/ErrorView';
import InfoView from './components/InfoView';
import logger from './modules/logger';
import React from 'react';
import useExtraLifeData from './hooks/useExtraLifeData';
import useHelperSettings from './hooks/useHelperSettings';
import useSound from 'use-sound';

function App () {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [contentScale, setContentScale] = useState(1);
    const { i18n } = useTranslation();
    const [playSound, { sound }] = useSound(alertSfx);
    const helperSettings = useHelperSettings();
    const { extraLifeData, refreshData, setRequestEndpoint } = useExtraLifeData(undefined);

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            logger.debug('Refreshing Extra Life data...');
            refreshData();
        }, import.meta.env.VITE_POLLING_INTERVAL);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [refreshData]);

    useEffect(() => {
        const onKeyPress = evt => {
            switch (evt.key) {
                case 's':
                    sound.play();
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
    }, [playSound, sound]);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }

        if (helperSettings?.data === undefined) {
            return;
        }

        if (i18n.language !== helperSettings.data.lang) {
            logger.debug(`Setting language to ${helperSettings.data.lang}...`);
            i18n.changeLanguage(helperSettings.data.lang);
        }

        if (sound && sound.volume !== helperSettings.data.volume) {
            logger.debug(`Setting volume to ${helperSettings.data.volume}...`);
            sound.volume(helperSettings.data.volume);
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

        const type = helperSettings.data.participantId ? 'participants' : 'teams';
        const id = helperSettings.data.participantId || helperSettings.data.teamId;
        setRequestEndpoint(`${type}/${id}`);

    }, [setRequestEndpoint, helperSettings.data, helperSettings.error, i18n, sound]);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        if (totalDonations !== undefined && extraLifeData.numDonations > totalDonations) {
            logger.debug('Make a request for donations!');
        }

        if (totalDonations !== extraLifeData.numDonations) {
            setTotalDontaions(extraLifeData.numDonations);
        }
    }, [extraLifeData, totalDonations]);

    useEffect(() => {
        const getScale = () => {
            return window.innerWidth / import.meta.env.VITE_CONTENT_WIDTH;
        };

        const onWindowResize = () => {
            setContentScale(getScale());
        };

        logger.debug('Setting scale and listening for window resize...');

        setContentScale(getScale());

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    let content;

    if (errorMessage) {
        content = <ErrorView message={errorMessage} />;
    } else if (helperSettings.data) {
        content = <InfoView data={extraLifeData} settings={helperSettings.data} />;
    } else {
        return null;
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
                {content}
            </div>
        </div>
    );
}

export default App;
