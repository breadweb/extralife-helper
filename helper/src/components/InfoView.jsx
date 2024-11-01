import { useTranslation } from 'react-i18next';
import Progress from './Progress';
import React, { useEffect, useState } from 'react';
import TimeDisplay from './TimeDisplay';

const InfoView = ({
    amountToShow,
    amountToIncrement,
    fundraisingGoal,
    milestones,
    onAmountIncremented,
    settings,
}) => {
    const [amountRaised, setAmountRaised] = useState(amountToShow);
    const { t } = useTranslation();

    // The amount to increment is the sum of all recent donations that arrived between the previous
    // rendering of this component and the current rendering. It may be one donation if donation alerts
    // are disabled or if only one arrived. It could be up to N donations that all happened back to back.
    //
    // The reason to have both totals is to show some nice animations from the previous amount raised
    // to the new amount. The progress bar (if enabled) will animate to the next percentage amount. And
    // the amount raised money display will do a nice counting effect.
    //
    // After the animations are complete, this component informs the parent so it can then roll the
    // incremented amount into the total amount to support animating to the next total.
    useEffect(() => {
        let didCallbackTimeoutFire = false;

        // Delay setting the amount to account for the animation intro sequence.
        const stateChangeTimeoutId = setTimeout(() => {
            setAmountRaised(prevAmountRaised => prevAmountRaised + amountToIncrement);
        }, 2000);

        // Delay notifying the parent until the incrementing animations have completed.
        const callbackTimeoutId = setTimeout(() => {
            didCallbackTimeoutFire = true;
            onAmountIncremented();
        }, 4000);

        return () => {
            clearTimeout(stateChangeTimeoutId);
            clearTimeout(callbackTimeoutId);

            // If this component is dismounted before the callback timer fires, the parent still needs
            // to be notified so it can combine the amounts into the new total.
            if (!didCallbackTimeoutFire) {
                onAmountIncremented();
            }
        };
    }, [onAmountIncremented, amountToIncrement]);

    const isPlural = settings.teamId || settings.isRaisedLinePlural;

    let raisedLine;
    if (settings.progressFormat !== 'progressBar') {
        raisedLine = (
            <div
                className={
                    `text-[20px] font-cantarell text-helper3 whitespace-nowrap leading-none mt-2
                    animate-pop-in animate-delay-[.8s]`
                }
            >
                {isPlural ? t('OUR_AMOUNT_RAISED') : t('MY_AMOUNT_RAISED')}
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center justify-center w-full mx-6'>
            <TimeDisplay settings={settings} />
            {raisedLine}
            <div className='animate-fade-in animate-delay-[1.4s] flex justify-center w-full'>
                <Progress
                    amountRaised={amountRaised}
                    areCentsVisible={settings.areCentsVisible}
                    areMilestoneMarkersVisible={settings.areMilestoneMarkersVisible}
                    fundraisingGoal={fundraisingGoal}
                    isPlural={isPlural}
                    milestones={milestones}
                    moneyFormat={settings.moneyFormat}
                    progressFormat={settings.progressFormat}
                />
            </div>
        </div>
    );
};

export default React.memo(InfoView);
