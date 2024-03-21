import LatestDonationsView from '../components/LatestDonationsView';
import LogoView from '../components/LogoView';
import React, { useCallback, useEffect, useState } from 'react';

const useFillerContent = (latestDonations, settings) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [fillerContent, setFillerContent] = useState(null);

    useEffect(() => {
        let showContentInteval;
        let removeContentTimeout;

        if (isEnabled) {
            let content, setDelay, removeDelay;

            if (settings?.isLatestDonationsEnabled && latestDonations.length > 0) {
                content = (
                    <LatestDonationsView
                        latestDonations={latestDonations}
                        settings={settings}
                    />
                );
                setDelay = import.meta.env.VITE_SHOW_DONORS_INTERVAL;
                removeDelay = import.meta.env.VITE_DONORS_TTL;
            } else {
                content = (
                    <LogoView
                        doFadeOut={true}
                        settings={settings}
                    />
                );
                setDelay = import.meta.env.VITE_SHOW_LOGO_INTERVAL;
                removeDelay = import.meta.env.VITE_LOGO_TTL;
            }

            showContentInteval = setInterval(() => {
                setFillerContent(content);
                clearTimeout(removeContentTimeout);
                removeContentTimeout = setTimeout(() => {
                    setFillerContent(null);
                }, removeDelay);
            }, setDelay);
        } else {
            setFillerContent(null);
            clearInterval(showContentInteval);
            clearTimeout(removeContentTimeout);
        }

        return () => {
            setFillerContent(null);
            clearInterval(showContentInteval);
            clearTimeout(removeContentTimeout);
        };
    }, [isEnabled, latestDonations, settings]);

    const startFillerTimer = useCallback(() => {
        setIsEnabled(true);
    }, []);

    const stopFillerTimer = useCallback(() => {
        setIsEnabled(false);
    }, []);

    return {
        fillerContent: fillerContent,
        startFillerTimer: startFillerTimer,
        stopFillerTimer: stopFillerTimer,
    };
};

export default useFillerContent;
