import { Trans, useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import Progress from './Progress';
import React from 'react';
import TimeDisplay from './TimeDisplay';

const InfoView = ({ data, settings }) => {
    const { t } = useTranslation();

    if (!data) {
        return (
            <div className='animate-fade-in animate-delay-[1.8s] flex justify-center items-center w-full'>
                <LoadingSpinner />
            </div>
        );
    }

    const amountRaised = data.sumDonations + data.sumPledges;
    const isPluarl = settings.teamId || settings.isRaisedLinePlural;
    let raisedLine;

    if (settings.progressFormat === 'progressBar') {
        raisedLine = (
            <Trans
                i18nKey={ isPluarl ? 'OUR_PERCENT_RAISED' : 'MY_PERCENT_RAISED' }
                values={{
                    percent: Math.floor(amountRaised / data.fundraisingGoal * 100),
                }}
            />
        );
    } else {
        raisedLine = isPluarl ? t('OUR_AMOUNT_RAISED') : t('MY_AMOUNT_RAISED');
    }

    return (
        <div className='flex flex-col items-center justify-center w-full mx-7'>
            <TimeDisplay settings={settings} />
            <div
                className={
                    `text-[20px] font-cantarell text-helper3 whitespace-nowrap leading-none mt-2
                    animate-pop-in animate-delay-[1.2s]`
                }
            >
                {raisedLine}
            </div>
            <div className='animate-fade-in animate-delay-[1.8s] flex justify-center w-full'>
                <Progress
                    amountRaised={amountRaised}
                    fundraisingGoal={data.fundraisingGoal}
                    areCentsVisible={settings.areCentsVisible}
                    moneyFormat={settings.moneyFormat}
                    progressFormat={settings.progressFormat}
                />
            </div>
        </div>
    );
};

export default InfoView;
