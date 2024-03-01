import { useCallback, useEffect, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import axios from 'axios';
import logger from '../modules/logger';

const useExtraLifeData = () => {
    const [extraLifeData, setExtraLifeData] = useState(undefined);
    const [endpoint, setEndpoint] = useState(undefined);
    const [touchId, setTouchId] = useState(0);

    useEffect(() => {
        if (touchId > 0 && endpoint) {
            logger.debug(`Making request to ${endpoint} endpoint...`);
        } else {
            return;
        }

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
    }, [endpoint, touchId]);

    const requestData = useCallback(value => {
        setEndpoint(value);
        setTouchId(prevTouchId => prevTouchId + 1);
    }, []);

    return {
        extraLifeData: extraLifeData,
        requestData: requestData,
    };
};

export default useExtraLifeData;
