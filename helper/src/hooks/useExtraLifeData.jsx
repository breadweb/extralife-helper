import { DateTime } from 'luxon';
import { useCallback, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import { serializeError } from '../modules/utils';
import axios from 'axios';
import logger from '../modules/logger';

const useExtraLifeData = () => {
    const [extraLifeData, setExtraLifeData] = useState(undefined);
    const [requestError, setRequestError] = useState(undefined);

    const requestData = useCallback(endpoint => {
        logger.debug(`Making request to ${endpoint} endpoint...`);

        const axiosOptions = {
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}api/${endpoint}`,
            params: {
                version: '1.3',
                t: DateTime.now().toMillis(),
            },
        };

        axios(axiosOptions)
            .then(res => {
                setExtraLifeData(res.data);
                setRequestError(undefined);
            })
            .catch(err => {
                const error = parseRequestError(err);
                logger.error(`Error making request. Endpoint: ${endpoint}, Details: ${serializeError(error)}`);
                setRequestError(error);
            });
    }, []);

    return {
        extraLifeData: extraLifeData,
        requestData: requestData,
        requestError: requestError,
    };
};

export default useExtraLifeData;
