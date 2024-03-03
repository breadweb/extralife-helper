import { useCallback, useEffect, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

const useDonations = () => {
    const [lastQueuedDonationId, setLastQueuedDonationId] = useState(undefined);
    const [recentDonations, setRecentDonations] = useState([]);
    const [unseenDonations, setUnseenDonations] = useState([]);
    const { extraLifeData, requestData } = useExtraLifeData(undefined);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        // Always update the recent donations from the response received. There will be up to 100
        // donations since only one request to the endpoint is made. These recent donations may be
        // from the previous session, the current session or both.
        setRecentDonations(extraLifeData);

        // Next, process unseen donations for the current session. If the last queued donation ID is
        // undefined, this is the first time processing donation data for this session and nothing
        // should be marked as unseen.
        if (lastQueuedDonationId === undefined) {
            if (extraLifeData.length > 0) {
                // Donations were received during a previous session. Set the most recent donation as
                // the last queued donation.
                setLastQueuedDonationId(extraLifeData[0].donationID);
            } else {
                // No donations have been received at all for the current user or team. Set a value that
                // will ensure the first donations will be added to the queue during this session.
                setLastQueuedDonationId('nonce');
            }
        } else {
            const newUnseenDonations = [];

            const wasLastDonationIdFound = extraLifeData.some(donation => {
                if (donation.donationID !== lastQueuedDonationId) {
                    newUnseenDonations.unshift(donation);
                    return false;
                }
                return true;
            });

            if (newUnseenDonations.length > 0) {
                // Because the donations endpoint only returns 100 results per request, it is possible
                // (although highly unlikely for most participants and teams that use the Helper) that
                // the last donation ID is not in the returned list.
                if (!wasLastDonationIdFound && newUnseenDonations.length >= 100) {
                    logger.warning(
                        'Did not find last donation ID in the returned results. 100 or more donations ' +
                        'are new since the last check.',
                    );
                }

                logger.debug(`${newUnseenDonations.length} total new donations discovered.`);

                setLastQueuedDonationId(extraLifeData[0].donationID);
                setUnseenDonations(prevUnseenDonations => {
                    return [
                        ...prevUnseenDonations,
                        ...newUnseenDonations,
                    ];
                });
            }
        }

    }, [extraLifeData, lastQueuedDonationId, setUnseenDonations]);

    const removeSeenDonation = useCallback(() => {
        setUnseenDonations(prevUnseenDonations => {
            const [, ...rest] = prevUnseenDonations;
            return rest;
        });
    }, []);

    const getUnseenDonations = useCallback(endpoint => {
        requestData(endpoint);
    }, [requestData]);

    return {
        getUnseenDonations: getUnseenDonations,
        removeSeenDonation: removeSeenDonation,
        unseenDonations: unseenDonations,
        recentDonations: recentDonations,
    };
};

export default useDonations;
