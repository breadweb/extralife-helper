import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DonationView from './DonationView';
import ErrorView from './ErrorView';
import InfoView from './InfoView';
import LoadingSpinner from './LoadingSpinner';
import MilestoneView from './MilestoneView';
import React from 'react';
import useDonations from '../hooks/useDonations';
import useFillerContent from '../hooks/useFillerContent';
import useMetrics from '../hooks/useMetrics';
import useMilestones from '../hooks/useMilestones';
import usePolledExtraLifeData from '../hooks/usePolledExtraLifeData';

const MAX_REQUEST_ERRORS = 4;

const getEndpoint = (settings, path) => {
    let type;
    if (settings.participantId) {
        type = 'participants';
    } else if (settings.teamId) {
        type = 'teams';
    } else {
        return null;
    }

    const id = settings.participantId || settings.teamId;
    return `${type}/${id}${path ? `/${path}` : ''}`;
};

const ContentManager = ({ errorMessage, settings }) => {
    const [totalRequestErrors, setTotalRequestErrors] = useState(0);
    const [totalDonations, setTotalDontaions] = useState(undefined);
    const [amountToIncrement, setAmountToIncrement] = useState(0);
    const [amountRaisedToShow, setAmountRaisedToShow] = useState(0);
    const [donationToShow, setDonationToShow] = useState(undefined);
    const [milestoneToShow, setMilestoneToShow] = useState(undefined);
    const [settingsErrorMessageToShow, setSettingsErrorMessageToShow] = useState(undefined);
    const [requestErrorMessageToShow, setRequestErrorMessageToShow] = useState(undefined);
    const { isPolling, startPolling, polledDataResponse, polledDataError } = usePolledExtraLifeData();
    const { getDonations, latestDonations, removeSeenDonation, unseenDonations } = useDonations();
    const { completedMilestones, getMilestones, milestones, removeCompletedMilestone } = useMilestones();
    const { fillerContent, startFillerTimer, stopFillerTimer } = useFillerContent(latestDonations, settings);
    useMetrics(errorMessage, settings, polledDataResponse?.extraLifeData);
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
        if (errorMessage) {
            setSettingsErrorMessageToShow(errorMessage);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (polledDataError) {
            setTotalRequestErrors(prevTotalErrors => prevTotalErrors += 1);
            return;
        } else {
            setTotalRequestErrors(0);
        }
    }, [polledDataError]);

    useEffect(() => {
        if (!polledDataResponse.extraLifeData) {
            return;
        }

        const didTotalChange = totalDonations !== polledDataResponse.extraLifeData.numDonations;

        if (polledDataResponse.requestCount === 1 || (!settings.areDonationAlertsEnabled && didTotalChange)) {
            setAmountToIncrement(
                polledDataResponse.extraLifeData.sumDonations + polledDataResponse.extraLifeData.sumPledges,
            );
        }

        if (didTotalChange) {
            if (
                settings.participantId &&
                (settings.areMilestoneAlertsEnabled || settings.areMilestoneMarkersVisible)
            ) {
                getMilestones(getEndpoint(settings, 'milestones'));
            }

            if (settings.areDonationAlertsEnabled) {
                getDonations(getEndpoint(settings, 'donations'));
            }

            setTotalDontaions(polledDataResponse.extraLifeData.numDonations);
        }
    }, [getDonations, getMilestones, polledDataResponse, settings, totalDonations]);

    useEffect(() => {
        let errorLangKey;

        if (polledDataError) {
            // Some errors should only be shown if they happen multiple times in a row. These errors
            // can happen occasionally due to intermittent client, server, or network issues which
            // might resolve on their own. No need to show a disruptive error message too quickly.
            if (totalRequestErrors > MAX_REQUEST_ERRORS) {
                if (polledDataError.status === 429) {
                    errorLangKey = 'REQUEST_ERROR_RATE_LIMITED';
                } else if (polledDataError.status >= 500 && polledDataError.status < 600) {
                    errorLangKey = 'REQUEST_ERROR_SERVICE_ERROR';
                } else if (polledDataError.status === 0) {
                    errorLangKey = 'REQUEST_ERROR_NO_CONNECTION';
                } else {
                    errorLangKey = 'REQUEST_ERROR_OTHER';
                }
            } else {
                // These errors will not get resolved without action from the user.
                if (polledDataError.status === 404) {
                    errorLangKey = 'REQUEST_ERROR_NOT_FOUND';
                }
            }
        }

        if (errorLangKey) {
            setRequestErrorMessageToShow(t(errorLangKey));
        } else {
            setRequestErrorMessageToShow(undefined);
        }
    }, [polledDataError, t, totalRequestErrors]);

    useEffect(() => {
        if (!settings?.areMilestoneAlertsEnabled) {
            return;
        }

        if (completedMilestones.length > 0) {
            setMilestoneToShow(completedMilestones[0]);
        } else {
            setMilestoneToShow(undefined);
        }
    }, [completedMilestones, settings]);

    useEffect(() => {
        if (unseenDonations.length > 0) {
            const unseenDonation = unseenDonations[0];
            setDonationToShow(unseenDonation);
            setAmountToIncrement(prevAmountToIncrement => prevAmountToIncrement + unseenDonation.amount);
        } else {
            setDonationToShow(undefined);
        }
    }, [unseenDonations]);

    useEffect(() => {
        if (donationToShow === undefined || milestoneToShow === undefined) {
            startFillerTimer();
        } else {
            stopFillerTimer();
        }
    }, [donationToShow, milestoneToShow, startFillerTimer, stopFillerTimer]);

    const onAmountIncremented = useCallback(() => {
        setAmountRaisedToShow(prevAmountRaisedToShow => prevAmountRaisedToShow + amountToIncrement);
        setAmountToIncrement(0);
    }, [amountToIncrement]);

    if (settingsErrorMessageToShow || requestErrorMessageToShow) {
        return (
            <ErrorView
                message={settingsErrorMessageToShow || requestErrorMessageToShow}
            />
        );
    }

    if (donationToShow) {
        return (
            <DonationView
                donation={donationToShow}
                onDonationAlertEnded={removeSeenDonation}
                settings={settings}
            />
        );
    }

    if (milestoneToShow) {
        return (
            <MilestoneView
                milestone={milestoneToShow}
                onMilestoneAlertEnded={removeCompletedMilestone}
                settings={settings}
            />
        );
    }

    if (fillerContent) {
        return fillerContent;
    }

    if (!polledDataResponse) {
        return (
            <div className='animate-fade-in animate-delay-[1s] flex justify-center items-center w-full'>
                <LoadingSpinner />
            </div>
        );
    }

    if (settings && polledDataResponse.extraLifeData) {
        return (
            <InfoView
                amountRaisedToShow={amountRaisedToShow}
                amountToIncrement={amountToIncrement}
                onAmountIncremented={onAmountIncremented}
                fundraisingGoal={polledDataResponse.extraLifeData.fundraisingGoal}
                milestones={milestones}
                settings={settings}
                unseenDonations={unseenDonations}
            />
        );
    }

    return null;
};

export default React.memo(ContentManager);
