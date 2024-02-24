import { useCallback, useEffect, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

function useDonations () {
    const [lastQueuedDonationId, setLastQueuedDonationId] = useState(undefined);
    const [unseenDonations, setUnseenDonations] = useState([]);
    const { extraLifeData, requestData } = useExtraLifeData(undefined);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        // If the last donation ID is undefined, this is the first time processing donation data for
        // this session.
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
                // (although highly unlikely for most use cases of the Helper) that the last donation ID
                // is not in the returned list.
                if (!wasLastDonationIdFound) {
                    logger.warning(
                        'Did not find last donation ID in the returned results. 100 or more donations ' +
                        'are new since the last check.',
                    );
                }

                logger.debug(`${newUnseenDonations.length} total new donations discovered.`);

                setLastQueuedDonationId(extraLifeData[0].donationID);
                setUnseenDonations(prevUnseenDonations => {
                    return {
                        ...prevUnseenDonations,
                        ...newUnseenDonations,
                    };
                });
            }
        }

    }, [extraLifeData, lastQueuedDonationId, setUnseenDonations]);

    const removeSeenDonation = useCallback(() => {
        const modifiedUnseenDonations = [...unseenDonations];
        const seenDonation = modifiedUnseenDonations.shift();
        logger.debug(`Seen donation removed from the queue. Name: ${seenDonation.donationID}`);
        setUnseenDonations(modifiedUnseenDonations);
    }, [unseenDonations]);

    const getUnseenDonations = useCallback(endpoint => {
        requestData(endpoint);
    }, [requestData]);

    return {
        getUnseenDonations: getUnseenDonations,
        removeSeenDonation: removeSeenDonation,
        unseenDonations: unseenDonations,
    };
}

export default useDonations;
