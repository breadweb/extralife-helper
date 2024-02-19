import { useCallback, useEffect, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import axios from 'axios';
import logger from '../modules/logger';

function useExtraLifeData (initialEndpoint) {
    const [extraLifeData, setExtraLifeData] = useState(undefined);
    const [endpoint, setEndpoint] = useState(initialEndpoint);
    const [touchId, setTouchId] = useState(1);

    useEffect(() => {
        if (endpoint) {
            const axiosOptions = {
                method: 'GET',
                url: `${import.meta.env.VITE_API_BASE_URL}api/${endpoint}`,
            };

            axios(axiosOptions)
                .then(res => {
                    setExtraLifeData(res.data);
                })
                .catch(err => {
                    logger.error(parseRequestError(err));
                });
        }
    }, [endpoint, touchId]);

    const refreshData = useCallback(() => {
        setTouchId(prevTouchId => prevTouchId + 1);
    }, []);

    const setRequestEndpoint = useCallback(value => {
        setEndpoint(value);
    }, []);

    return {
        extraLifeData: extraLifeData,
        refreshData: refreshData,
        setRequestEndpoint: setRequestEndpoint,
    };
}

export default useExtraLifeData;
