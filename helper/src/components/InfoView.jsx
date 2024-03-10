import { useTranslation } from 'react-i18next';
import Progress from './Progress';
import React, { useEffect, useState } from 'react';
import TimeDisplay from './TimeDisplay';

const InfoView = ({
    amountRaisedToShow,
    amountToIncrement,
    fundraisingGoal,
    milestones,
    onAmountIncremented,
    settings,
}) => {
    const [amountRaised, setAmountRaised] = useState(amountRaisedToShow);
    const { t } = useTranslation();

    useEffect(() => {
        let didTimeoutFire = false;

        // The amount to increment is the sum of all recent donations that arrived between the
        // previous rendering of this component and the current rendering. It may be one donation
        // if donation alerts are disabled or if only one arrived. It could be up to N donations
        // that all happened back to back.
        //
        // The reason to have both totals is to show some nice animations from the previous amount
        // raised to the new amount. The progress bar (if enabled) will aniamte to the next
        // percentage amount. And the amount raised money display will do a nice counting effect.
        //
        // After the animations are complete, this component informs the parent so it can then roll
        // the incremented amount into the total amount to support animating to the next total.
        const timeoutId = setTimeout(() => {
            didTimeoutFire = true;
            setAmountRaised(prevAmountRaised => prevAmountRaised + amountToIncrement);
            onAmountIncremented();
        }, 2000);

        return () => {
            // If this component is dismounted before the timer fires, the parent still needs to
            // be notified so it can combine the amounts into the new total.
            if (!didTimeoutFire) {
                onAmountIncremented();
            }
            clearTimeout(timeoutId);
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
        <div className='flex flex-col items-center justify-center w-full mx-7'>
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
