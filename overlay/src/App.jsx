import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import alertSfx from './assets/audio/alert.mp3';
import classNames from 'classnames';
import colorConvert from 'color-convert';
import ErrorView from './components/ErrorView';
import InfoView from './components/InfoView';
import logger from './modules/logger';
import React from 'react';
import useDonations from './hooks/useDonations';
import useHelperSettings from './hooks/useHelperSettings';
import usePolledExtraLifeData from './hooks/usePolledExtraLifeData';
import useSound from 'use-sound';

const constructEndpoint = (settings, path) => {
    const type = settings.participantId ? 'participants' : 'teams';
    const id = settings.participantId || settings.teamId;
    return `${type}/${id}${path ? `/${path}` : ''}`;
};

function App () {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [contentScale, setContentScale] = useState(1);
    const { i18n } = useTranslation();
    const [playSound, { sound }] = useSound(alertSfx);
    const helperSettings = useHelperSettings();
    const { extraLifeData, isPolling, startPolling, stopPolling } = usePolledExtraLifeData();
    const { getUnseenDonations, removeSeenDonation, unseenDonations } = useDonations();

    useEffect(() => {
        const onKeyPress = evt => {
            switch (evt.key) {
                case 'a':
                    sound.play();
                    break;
                case 's':
                    startPolling();
                    break;
                case 't':
                    stopPolling();
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
    }, [playSound, sound, startPolling, stopPolling]);

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

        if (sound && sound.volume() !== helperSettings.data.volume) {
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

        if (!isPolling()) {
            startPolling(constructEndpoint(helperSettings.data));
        }

    }, [helperSettings.data, helperSettings.error, i18n, isPolling, sound, startPolling]);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        if (totalDonations !== extraLifeData.numDonations) {
            console.log('Requesting unseen donations!');
            getUnseenDonations(constructEndpoint(helperSettings.data, 'donations'));
            setTotalDontaions(extraLifeData.numDonations);
        }
    }, [extraLifeData, getUnseenDonations, helperSettings.data, totalDonations]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            logger.debug('There are unseen donations. Show an alert!');
            return;
        }
    }, [unseenDonations]);

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
