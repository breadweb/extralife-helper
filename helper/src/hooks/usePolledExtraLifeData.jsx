import { useCallback, useEffect, useState } from 'react';
import useExtraLifeData from './useExtraLifeData';

const usePolledExtraLifeData = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [endpoint, setEndpoint] = useState(undefined);
    const [polledDataResponse, setPolledDataResponse] = useState({
        requestCount: -1,
    });
    const { extraLifeData, requestData, requestError } = useExtraLifeData();

    useEffect(() => {
        let refreshInterval;

        if (endpoint && isEnabled) {
            requestData(endpoint);
            refreshInterval = setInterval(() => {
                requestData(endpoint);
            }, import.meta.env.VITE_POLLING_INTERVAL);
        } else {
            clearInterval(refreshInterval);
        }

        return () => {
            clearInterval(refreshInterval);
        };
    }, [endpoint, isEnabled, requestData]);

    useEffect(() => {
        setPolledDataResponse(prevPolledDataResponse => {
            return {
                extraLifeData: extraLifeData,
                requestCount: prevPolledDataResponse.requestCount + 1,
            };
        });
    }, [extraLifeData]);

    const startPolling = useCallback(endpoint => {
        console.log('Starting polling...');
        setEndpoint(endpoint);
        setIsEnabled(true);
    }, []);

    const stopPolling = useCallback(() => {
        console.log('Stopping polling...');
        setIsEnabled(false);
    }, []);

    const isPolling = useCallback(() => {
        return isEnabled;
    }, [isEnabled]);

    return {
        polledDataResponse: polledDataResponse,
        polledDataError: requestError,
        isPolling: isPolling,
        startPolling: startPolling,
        stopPolling: stopPolling,
    };
};

export default usePolledExtraLifeData;
