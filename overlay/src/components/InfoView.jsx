import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import Progress from './Progress';
import React from 'react';
import TimeDisplay from './TimeDisplay';

const InfoView = ({ data, milestones, settings }) => {
    const { t } = useTranslation();

    if (!data) {
        return (
            <div className='animate-fade-in animate-delay-[1s] flex justify-center items-center w-full'>
                <LoadingSpinner />
            </div>
        );
    }

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
                    amountRaised={data.sumDonations + data.sumPledges}
                    areCentsVisible={settings.areCentsVisible}
                    areMilestoneMarkersVisible={settings.areMilestoneMarkersVisible}
                    fundraisingGoal={data.fundraisingGoal}
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
