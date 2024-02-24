import { useCallback, useEffect, useRef, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

function usePolledExtraLifeData () {
    const [isEnabled, setIsEnabled] = useState(false);
    const [endpoint, setEndpoint] = useState(undefined);
    const { extraLifeData, requestData } = useExtraLifeData();
    const refreshInterval = useRef();

    useEffect(() => {
        if (endpoint && isEnabled) {
            logger.debug('Starting polling... ');

            requestData(endpoint);

            refreshInterval.current = setInterval(() => {
                requestData(endpoint);
            }, import.meta.env.VITE_POLLING_INTERVAL);
        } else {
            logger.debug('Stopping polling...');
            clearInterval(refreshInterval.current);
        }

        return () => {
            clearInterval(refreshInterval.current);
        };
    }, [endpoint, isEnabled, requestData]);

    const startPolling = useCallback(endpoint => {
        setEndpoint(endpoint);
        setIsEnabled(true);
    }, []);

    const stopPolling = useCallback(() => {
        setIsEnabled(false);
    }, []);

    const isPolling = useCallback(() => {
        return isEnabled;
    }, [isEnabled]);

    return {
        extraLifeData: extraLifeData,
        isPolling: isPolling,
        startPolling: startPolling,
        stopPolling: stopPolling,
    };
}

export default usePolledExtraLifeData;
