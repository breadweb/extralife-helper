import { useEffect, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import { serializeError } from '../modules/utils';
import axios from 'axios';
import logger from '../modules/logger';

const useMetrics = (settings, extraLifeData) => {
    const [wereMetricsSent, setWereMetricsSent] = useState(false);

    useEffect(() => {
        if (!settings?.areMetricsEnabled || !extraLifeData || wereMetricsSent) {
            return;
        }

        const axiosOptions = {
            method: 'POST',
            url: 'https://api.breadweb.net/helper-metrics',
            data: {
                event: 'init',
                props: {
                    displayName: extraLifeData.displayName,
                    eventId: extraLifeData.eventID,
                    isTest: false,
                    mode: settings.participantId !== '' ? 'participant' : 'team',
                    participantId: extraLifeData.participantID,
                    runtimeMode: import.meta.env.VITE_RUNTIME_MODE,
                    streamingChannel: extraLifeData.streamingChannel,
                    streamingPlatform: extraLifeData.streamingPlatform,
                    teamId: extraLifeData.teamID,
                    teamName: settings.mode === 'team' ? extraLifeData.name : extraLifeData.teamName,
                },
            },
        };

        // Mark metrics as being sent even if the request eventually fails.
        setWereMetricsSent(true);

        axios(axiosOptions)
            .then(res => {
                logger.debug('Metrics sent!');
            })
            .catch(err => {
                const error = parseRequestError(err);
                logger.error(`Error making metrics request. Details: ${serializeError(error)}`);
            });
    }, [extraLifeData, settings, wereMetricsSent]);
};

export default useMetrics;
