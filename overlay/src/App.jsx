import { useEffect, useRef, useState } from 'react';
import useHelperSettings from './hooks/useHelperSettings';
import useExtraLifeData from './hooks/useExtraLifeData';
import useSound from 'use-sound';
import alertSfx from './assets/audio/alert.mp3';
import ErrorView from './components/ErrorView';
import InfoView from './components/InfoView';

function App() {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [playSound, { sound }] = useSound(alertSfx);
    const helperSettings = useHelperSettings();
    const extraLife = useExtraLifeData(undefined);
    const getRefreshedDataTimer = useRef();

    useEffect(() => {
        clearInterval(getRefreshedDataTimer?.current);
        getRefreshedDataTimer.current = setInterval(() => {
            console.log('Refreshing data...');
            extraLife.refreshData();
        }, import.meta.env.VITE_POLLING_INTERVAL);
        return () => {
            clearInterval(getRefreshedDataTimer?.current);
        };
    }, [extraLife.refreshData, getRefreshedDataTimer]);

    useEffect(() => {
        const onKeyPress = evt => {
            switch (evt.key) {
                case 's':
                    sound.volume(helperSettings.data?.volume || 1);
                    sound.play();
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
    }, [playSound]);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }

        if (helperSettings?.data === undefined) {
            return;
        }

        extraLife.setRequestOptions(
            helperSettings.data.participantId ? 'participants' : 'teams',
            helperSettings.data.participantId || helperSettings.data.teamId,
        );
    }, [helperSettings.data, helperSettings.error]);

    useEffect(() => {
        if (!extraLife.data) {
            return;
        }

        if (totalDonations !== undefined && extraLife.data.numDonations > totalDonations) {
            console.log('Make a request for donations!');
        }

        if (totalDonations !== extraLife.data.numDonations) {
            setTotalDontaions(extraLife.data.numDonations);
        }

    }, [extraLife.data]);

    if (errorMessage) {
        return (
            <ErrorView message={errorMessage} />
        );
    } else {
        return (
            <InfoView data={extraLife.data} settings={helperSettings} />
        );
    }
}

export default App
