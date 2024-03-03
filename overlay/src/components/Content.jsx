import { useEffect, useState } from 'react';
import DonationView from './DonationView';
import ErrorView from './ErrorView';
import InfoView from './InfoView';
import logger from '../modules/logger';
import React from 'react';
import useDonations from '../hooks/useDonations';
import useFillerContent from '../hooks/userFillerContent';
import usePolledExtraLifeData from '../hooks/usePolledExtraLifeData';

const getEndpoint = (settings, path) => {
    const type = settings.participantId ? 'participants' : 'teams';
    const id = settings.participantId || settings.teamId;
    return `${type}/${id}${path ? `/${path}` : ''}`;
};

const Content = ({ errorMessage, settings }) => {
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [donationtoToShow, setDonationToShow] = useState(undefined);
    const { extraLifeData, isPolling, startPolling } = usePolledExtraLifeData();
    const { getUnseenDonations, recentDonations, removeSeenDonation, unseenDonations } = useDonations();
    const { fillerContent, startFillerTimer, stopFillerTimer } = useFillerContent(recentDonations, settings);

    useEffect(() => {
        if (!settings) {
            return;
        }

        if (!isPolling()) {
            startPolling(getEndpoint(settings));
        }
    }, [isPolling, settings, startPolling]);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        if (totalDonations !== extraLifeData.numDonations) {
            logger.debug('Requesting unseen donations!');
            getUnseenDonations(getEndpoint(settings, 'donations'));
            setTotalDontaions(extraLifeData.numDonations);
        }
    }, [extraLifeData, getUnseenDonations, settings, totalDonations]);

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

    if (errorMessage) {
        return (
            <ErrorView
                message={errorMessage}
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
