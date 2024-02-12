import { useCallback, useEffect, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import axios from 'axios';

function useExtraLifeData (initialOptions) {
    const [data, setData] = useState(undefined);
    const [options, setOptions] = useState(initialOptions);
    const [touchId, setTouchId] = useState(1);

    useEffect(() => {
        if (options) {
            const axiosOptions = {
                method: 'GET',
                url: `${import.meta.env.VITE_API_BASE_URL}api/${options.type}/${options.id}`,
            };

            axios(axiosOptions)
                .then(res => {
                    setData(res.data);
                })
                .catch(err => {
                    console.error(parseRequestError(err));
                });
        }
    }, [options, touchId]);

    const setRequestOptions = useCallback((type, id) => {
        setOptions({ type, id });
    }, []);

    const refreshData = useCallback(() => {
        setTouchId(prevTouchId => prevTouchId + 1);
    }, []);

    return {
        data: data,
        refreshData: refreshData,
        setRequestOptions: setRequestOptions,
    };
}

export default useExtraLifeData;
