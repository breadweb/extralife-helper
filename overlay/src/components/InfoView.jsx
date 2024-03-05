import { useTranslation } from 'react-i18next';
import Progress from './Progress';
import React from 'react';
import TimeDisplay from './TimeDisplay';

const InfoView = ({ amountRaised, fundraisingGoal, milestones, settings }) => {
    const { t } = useTranslation();

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
