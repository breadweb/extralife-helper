import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import colorConvert from 'color-convert';
import DonationView from './components/DonationView';
import ErrorView from './components/ErrorView';
import InfoView from './components/InfoView';
import logger from './modules/logger';
import React from 'react';
import transparencyGrid from './assets/images/transparency-grid.png';
import useDonations from './hooks/useDonations';
import useFillerContent from './hooks/userFillerContent';
import useHelperSettings from './hooks/useHelperSettings';
import usePolledExtraLifeData from './hooks/usePolledExtraLifeData';

const getEndpoint = (settings, path) => {
    const type = settings.participantId ? 'participants' : 'teams';
    const id = settings.participantId || settings.teamId;
    return `${type}/${id}${path ? `/${path}` : ''}`;
};

const getScale = () => {
    return window.innerWidth / import.meta.env.VITE_CONTENT_WIDTH;
};

const App = () => {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [donationtoToShow, setDonationToShow] = useState(undefined);
    const [contentScale, setContentScale] = useState(1);
    const { i18n } = useTranslation();
    const helperSettings = useHelperSettings();
    const { extraLifeData, isPolling, startPolling } = usePolledExtraLifeData();
    const { getUnseenDonations, recentDonations, removeSeenDonation, unseenDonations } = useDonations();
    const { fillerContent, startFillerTimer, stopFillerTimer } =
        useFillerContent(recentDonations, helperSettings.data);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }

        if (helperSettings?.data === undefined) {
            return;
        }

        if (i18n.language !== helperSettings.data.lang) {
            logger.debug(`Changing language to ${helperSettings.data.lang}...`);
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

        if (!isPolling()) {
            startPolling(getEndpoint(helperSettings.data));
        }

    }, [helperSettings.data, helperSettings.error, i18n, isPolling, startPolling]);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        if (totalDonations !== extraLifeData.numDonations) {
            logger.debug('Requesting unseen donations!');
            getUnseenDonations(getEndpoint(helperSettings.data, 'donations'));
            setTotalDontaions(extraLifeData.numDonations);
        }
    }, [extraLifeData, getUnseenDonations, helperSettings.data, totalDonations]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            setDonationToShow(unseenDonations[0]);
        } else {
            setDonationToShow(undefined);
        }
    }, [unseenDonations]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            stopFillerTimer();
        } else {
            startFillerTimer();
        }
    }, [startFillerTimer, stopFillerTimer, unseenDonations]);

    useEffect(() => {
        startFillerTimer();

        const onWindowResize = () => {
            setContentScale(getScale());
        };

        setContentScale(getScale());

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, [startFillerTimer]);

    let content;

    if (errorMessage) {
        content = (
            <ErrorView message={errorMessage} />
        );
    } else if (donationtoToShow) {
        content = (
            <DonationView
                donation={donationtoToShow}
                onDonationAlertEnded={removeSeenDonation}
                settings={helperSettings.data}
            />
        );
    } else if (fillerContent) {
        content = fillerContent;
    } else if (helperSettings.data) {
        content = (
            <InfoView
                data={extraLifeData}
                settings={helperSettings.data}
            />
        );
    } else {
        return null;
    }

    // If running in development mode and transparent backgournd setting is enabled, show a transparency
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
                {content}
            </div>
        </div>
    );
};

export default App;
