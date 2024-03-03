import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DonationView from './DonationView';
import ErrorView from './ErrorView';
import InfoView from './InfoView';
import logger from '../modules/logger';
import React from 'react';
import useDonations from '../hooks/useDonations';
import useFillerContent from '../hooks/userFillerContent';
import usePolledExtraLifeData from '../hooks/usePolledExtraLifeData';

const MAX_REQUEST_ERRORS = 4;

const getEndpoint = (settings, path) => {
    const type = settings.participantId ? 'participants' : 'teams';
    const id = settings.participantId || settings.teamId;
    return `${type}/${id}${path ? `/${path}` : ''}`;
};

const Content = ({ errorMessage, settings }) => {
    const [totalRequestErrors, setTotalRequestErrors] = useState(0);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [donationtoToShow, setDonationToShow] = useState(undefined);
    const [errorMessageToShow, setErrorMessageToShow] = useState(errorMessage);
    const { extraLifeData, isPolling, startPolling, requestError } = usePolledExtraLifeData();
    const { getDonations, recentDonations, removeSeenDonation, unseenDonations } = useDonations();
    const { fillerContent, startFillerTimer, stopFillerTimer } = useFillerContent(recentDonations, settings);
    const { t } = useTranslation();

    useEffect(() => {
        if (!settings) {
            return;
        }

        if (!isPolling()) {
            startPolling(getEndpoint(settings));
        }
    }, [isPolling, settings, startPolling]);

    useEffect(() => {
        if (requestError) {
            setTotalRequestErrors(prevTotalErrors => prevTotalErrors += 1);
            return;
        } else {
            setTotalRequestErrors(0);
        }

        if (!extraLifeData) {
            return;
        }

        if (totalDonations !== extraLifeData.numDonations) {
            logger.debug('Requesting donations...');
            getDonations(getEndpoint(settings, 'donations'));
            setTotalDontaions(extraLifeData.numDonations);
        }
    }, [extraLifeData, getDonations, requestError, settings, totalDonations]);

    useEffect(() => {
        let errorLangKey;

        if (requestError) {
            // Some errors should only be shown if they happen multiple times in a row. These errors
            // can happen occasionally due to intermittent client, server, or network issues which
            // might resolve on their own. No need to show a disruptive error message too quickly.
            if (totalRequestErrors > MAX_REQUEST_ERRORS) {
                if (requestError.status === 429) {
                    errorLangKey = 'REQUEST_ERROR_RATE_LIMITED';
                } else if (requestError.status >= 500 && requestError.status < 600) {
                    errorLangKey = 'REQUEST_ERROR_SERVICE_ERROR';
                } else if (requestError.status === 0) {
                    errorLangKey = 'REQUEST_ERROR_NO_CONNECTION';
                } else {
                    errorLangKey = 'REQUEST_ERROR_OTHER';
                }
            } else {
                // These errors will not get resolved without action from the user.
                if (requestError.status === 404) {
                    errorLangKey = 'REQUEST_ERROR_NOT_FOUND';
                }
            }
        }

        if (errorLangKey) {
            setErrorMessageToShow(t(errorLangKey));
        } else {
            setErrorMessageToShow(undefined);
        }
    }, [requestError, t, totalRequestErrors]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            setDonationToShow(unseenDonations[0]);
        } else {
            setDonationToShow(undefined);
        }
    }, [unseenDonations]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            stopFillerTimer();
        } else {
            startFillerTimer();
        }
    }, [startFillerTimer, stopFillerTimer, unseenDonations]);

    if (errorMessageToShow) {
        return (
            <ErrorView
                message={errorMessageToShow}
            />
        );
    }

    if (donationtoToShow) {
        return (
            <DonationView
                donation={donationtoToShow}
                onDonationAlertEnded={removeSeenDonation}
                settings={settings}
            />
        );
    }

    if (fillerContent) {
        return fillerContent;
    }

    if (settings) {
        return (
            <InfoView
                data={extraLifeData}
                settings={settings}
            />
        );
    }

    return null;
};

export default React.memo(Content);
