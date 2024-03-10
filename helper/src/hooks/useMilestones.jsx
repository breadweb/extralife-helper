import { useCallback, useEffect, useState } from 'react';
import logger from '../modules/logger';
import useExtraLifeData from './useExtraLifeData';

const useMilestones = () => {
    const [lastCompletedMilestoneId, setLastCompletedMilestoneId] = useState(undefined);
    const [milestones, setMilestones] = useState([]);
    const [completedMilestones, setCompletedMilestones] = useState([]);
    const { extraLifeData, requestData, requestError } = useExtraLifeData(undefined);

    useEffect(() => {
        if (!extraLifeData) {
            return;
        }

        // Always update the list of milestones in case they were changed by the user.
        setMilestones(extraLifeData);

        // Next, process milestones that completed during the current session. If the last completed
        // milestone ID is undefined, this is the first time processing milestone data for this session
        // and nothing should be marked as completed.
        if (lastCompletedMilestoneId === undefined) {
            let milestoneId = 'nonce';
            for (let i = 0; i < extraLifeData.length; i++) {
                const milestone = extraLifeData[i];
                if (milestone.isComplete === true) {
                    milestoneId = milestone.milestoneID;
                } else {
                    break;
                }
            }
            setLastCompletedMilestoneId(milestoneId);
        } else {
            const newCompletedMilestones = [];

            for (let i = extraLifeData.length - 1; i >= 0; i--) {
                const milestone = extraLifeData[i];
                if (milestone.milestoneID !== lastCompletedMilestoneId) {
                    if (milestone.isComplete === true) {
                        newCompletedMilestones.unshift(milestone);
                    }
                } else {
                    break;
                }
            }

            if (newCompletedMilestones.length > 0) {
                logger.debug(`${newCompletedMilestones.length} newly completed milestones discovered.`);

                setLastCompletedMilestoneId(
                    newCompletedMilestones[newCompletedMilestones.length - 1].milestoneID,
                );
                setCompletedMilestones(prevCompletedMilestones => {
                    return [
                        ...prevCompletedMilestones,
                        ...newCompletedMilestones,
                    ];
                });
            }
        }

    }, [extraLifeData, lastCompletedMilestoneId, setCompletedMilestones]);

    const removeCompletedMilestone = useCallback(() => {
        setCompletedMilestones(prevCompletedMilestones => {
            const [, ...rest] = prevCompletedMilestones;
            return rest;
        });
    }, []);

    const getMilestones = useCallback(endpoint => {
        requestData(endpoint);
    }, [requestData]);

    return {
        getMilestones: getMilestones,
        removeCompletedMilestone: removeCompletedMilestone,
        completedMilestones: completedMilestones,
        milestones: milestones,
        requestError: requestError,
    };
};

export default useMilestones;
