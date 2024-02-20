import { useCallback, useEffect, useRef, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

function usePolledExtraLifeData (initialEndpoint) {
    const [isEnabled, setIsEnabled] = useState(false);
    const { extraLifeData, hasRequestEndpoint, refreshData, setRequestEndpoint } = useExtraLifeData(initialEndpoint);
    const refreshInterval = useRef();

    useEffect(() => {
        if (isEnabled) {
            logger.debug('Starting polling...');
            refreshInterval.current = setInterval(() => {
                logger.debug('Refreshing data...');
                refreshData();
            }, import.meta.env.VITE_POLLING_INTERVAL);
        } else {
            logger.debug('Stopping polling...');
            clearInterval(refreshInterval.current);
        }

        return () => {
            clearInterval(refreshInterval.current);
        };
    }, [isEnabled, refreshData]);

    const setRequestEndpointAndStartPolling = useCallback(endpoint => {
        setRequestEndpoint(endpoint);
        setIsEnabled(true);
    }, [setIsEnabled, setRequestEndpoint]);

    const startPolling = useCallback(() => {
        if (!hasRequestEndpoint()) {
            logger.info('Not starting polling because request endpoint has not been set.');
            return;
        }
        setIsEnabled(true);
    }, [hasRequestEndpoint, setIsEnabled]);

    const stopPolling = useCallback(() => {
        setIsEnabled(false);
    }, [setIsEnabled]);

    return {
        extraLifeData: extraLifeData,
        setRequestEndpoint: setRequestEndpointAndStartPolling,
        startPolling: startPolling,
        stopPolling: stopPolling,
    };
}

export default usePolledExtraLifeData;
