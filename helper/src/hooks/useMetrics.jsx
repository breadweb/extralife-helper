import { useEffect, useState } from 'react';
import { parseRequestError } from '../modules/requests';
import { serializeError } from '../modules/utils';
import axios from 'axios';
import logger from '../modules/logger';

const useMetrics = (errorMessage, settings, extraLifeData) => {
    const [wereMetricsSent, setWereMetricsSent] = useState(false);

    useEffect(() => {
        if (
            errorMessage ||
            !settings?.areMetricsEnabled ||
            settings.previewMode ||
            !extraLifeData ||
            wereMetricsSent
        ) {
            return;
        }

        const axiosOptions = {
            method: 'POST',
            url: 'https://api.breadweb.net/helper-metrics',
            data: {
                event: 'init',
                props: {
                    // Extra Life Info
                    displayName: extraLifeData.displayName,
                    eventId: extraLifeData.eventID,
                    teamId: extraLifeData.teamID,
                    teamName: extraLifeData.participantID ? extraLifeData.teamName : extraLifeData.name,
                    streamingChannel: extraLifeData.streamingChannel,
                    streamingPlatform: extraLifeData.streamingPlatform,
                    participantId: extraLifeData.participantID,
                    // Setting Info
                    theme: settings.theme,
                    border: settings.border,
                    isBackgroundTransparent: settings.isBackgroundTransparent,
                    isLatestDonationsEnabled: settings.isLatestDonationsEnabled,
                    areDonationAlertsEnabled: settings.areDonationAlertsEnabled,
                    areMilestoneAlertsEnabled: settings.areMilestoneAlertsEnabled,
                    isConfettiEnabled: settings.isConfettiEnabled,
                    isRaisedLinePlural: settings.isRaisedLinePlural,
                    progressFormat: settings.progressFormat,
                    areMilestoneMarkersVisible: settings.areMilestoneMarkersVisible,
                    areCentsVisible: settings.areCentsVisible,
                    moneyFormat: settings.moneyFormat,
                    isYearModeEnabled: settings.isYearModeEnabled,
                    voice: settings.voice,
                    volume: settings.volume,
                    lang: settings.lang,
                    // Config Info
                    userType: settings.participantId !== '' ? 'participant' : 'team',
                    runtimeMode: import.meta.env.VITE_RUNTIME_MODE,
                    isTest: false,
                },
            },
        };

        // Mark metrics as being sent even if the request eventually fails.
        setWereMetricsSent(true);

        axios(axiosOptions)
            .then(res => {
                logger.debug('Metrics sent. Thank you for helping to improve the Helper!');
            })
            .catch(err => {
                const error = parseRequestError(err);
                logger.error(`Error making metrics request. Details: ${serializeError(error)}`);
            });
    }, [errorMessage, extraLifeData, settings, wereMetricsSent]);
};

export default useMetrics;
