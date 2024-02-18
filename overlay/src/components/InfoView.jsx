import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';
import useTimer from '../hooks/useTimer';

const ONE_DAY_IN_MS = 86400000;
const FOUR_DAYS_IN_MS = ONE_DAY_IN_MS * 4;

const currencyFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function InfoView ({ data, settings }) {
    const { t } = useTranslation();
    const timer = useTimer(settings?.startDateTime);

    let content;

    if (!data || !settings || !timer) {
        content = <LoadingSpinner />;
    } else {
        let timerLine;
        let time;

        if (settings.isYearModeEnabled) {
            timerLine = t('MAIN_TITLE');
            time = DateTime.now().toFormat('yyyy');
        } else {
            if (timer.ms < 0) {
                if (timer.ms < -FOUR_DAYS_IN_MS) {
                    timerLine = t('DAYS_UNTIL');
                    time = Math.ceil(timer.ms / ONE_DAY_IN_MS) * -1;
                } else {
                    timerLine = t('HOURS_UNTIL');
                    time = timer.clock;
                }
            } else {
                timerLine = t('HOURS_PLAYED');
                time = timer.clock;
            }
        }

        const raisedLine = settings.teamId || settings.isRaisedLinePlural
            ? t('OUR_AMOUNT_RAISED')
            : t('MY_AMOUNT_RAISED');

        let amountLine = currencyFormat.format(data.sumDonations + data.sumPledges);
        if (settings.isGoalVisible === true) {
            amountLine += ' / ' + currencyFormat.format(data.fundraisingGoal);
        }

        content = (
            <div className='flex flex-col items-center space-y-2'>
                <div>
                    {timerLine}
                </div>
                <div className='text-6xl font-roboto'>
                    {time}
                </div>
                <div>
                    {raisedLine}
                </div>
                <div className='text-4xl'>
                    {amountLine}
                </div>
            </div>
        )
    }

    return (
        <div className='bg-zinc-200 w-full h-full flex flex-col items-center justify-center'>
            {content}
        </div>
    );
}

export default InfoView;
