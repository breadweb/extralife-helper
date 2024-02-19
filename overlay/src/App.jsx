import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import alertSfx from './assets/audio/alert.mp3';
import classNames from 'classnames';
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
    const { t, i18n } = useTranslation();
    const [playSound, { sound }] = useSound(alertSfx);
    const helperSettings = useHelperSettings();
    const { data, refreshData, setRequestOptions } = useExtraLifeData(undefined);

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
            logger.debug('Applying theme...');
            document.documentElement.classList.add(helperSettings.data.theme);
        }

        setRequestOptions(
            helperSettings.data.participantId ? 'participants' : 'teams',
            helperSettings.data.participantId || helperSettings.data.teamId,
        );
    }, [setRequestOptions, helperSettings.data, helperSettings.error, i18n, sound]);

    useEffect(() => {
        if (!data) {
            return;
        }

        if (totalDonations !== undefined && data.numDonations > totalDonations) {
            logger.debug('Make a request for donations!');
        }

        if (totalDonations !== data.numDonations) {
            setTotalDontaions(data.numDonations);
        }
    }, [data, totalDonations]);

    useEffect(() => {
        const onWindowResize = () => {
            if (window.innerHeight > window.innerWidth) {
                setErrorMessage(t('PORTRAIT_NOT_ALLOWED'));
            } else {
                setErrorMessage(undefined);
            }
        };

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, [t]);

    let content;

    if (errorMessage) {
        content = <ErrorView message={errorMessage} />;
    } else if (helperSettings.data) {
        content = <InfoView data={data} settings={helperSettings.data} />;
    } else {
        return null;
    }

    return (
        <div
            className={
                classNames(
                    'w-full h-screen flex flex-col items-center justify-center',
                    'bg-helper2',
                    helperSettings.data?.border === 'square' ? 'border-2 border-helper1' : '',
                    helperSettings.data?.border === 'rounded' ? 'border-2 border-helper1 rounded' : '',
                )
            }
        >
            {content}
        </div>
    );


}

export default App;
