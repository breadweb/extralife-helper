import { useCallback, useEffect, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

const usePolledExtraLifeData = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [endpoint, setEndpoint] = useState(undefined);
    const { extraLifeData, requestData, requestError } = useExtraLifeData();

    useEffect(() => {
        let refreshInterval;

        if (endpoint && isEnabled) {
            logger.debug('Starting polling... ');

            requestData(endpoint);

            refreshInterval = setInterval(() => {
                requestData(endpoint);
            }, import.meta.env.VITE_POLLING_INTERVAL);
        } else {
            logger.debug('Stopping polling...');
            clearInterval(refreshInterval);
        }

        return () => {
            clearInterval(refreshInterval);
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
        requestError: requestError,
        isPolling: isPolling,
        startPolling: startPolling,
        stopPolling: stopPolling,
    };
};

export default usePolledExtraLifeData;
