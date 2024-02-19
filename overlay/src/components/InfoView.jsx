import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';
import useTimer from '../hooks/useTimer';

const ONE_DAY_IN_MS = 86400000;
const FOUR_DAYS_IN_MS = ONE_DAY_IN_MS * 4;

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

        const currencyFormat = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: settings.areCentsVisible ? 2 : 0,
            minimumFractionDigits: 0,
        });

        let amountLine = currencyFormat.format(data.sumDonations + data.sumPledges);
        if (settings.isGoalVisible) {
            amountLine += ' / ' + currencyFormat.format(data.fundraisingGoal);
        }

        content = (
            <div className='flex flex-col items-center'>
                <div
                    className={
                        classNames(
                            'text-xl font-furore text-helper3 animate-pop-in',
                            settings.lang === 'en-us' ? 'font-furore' : 'font-sans',
                        )
                    }
                >
                    {timerLine}
                </div>
                <div
                    className={
                        classNames(
                            'text-8xl font-digital text-helper4 -my-2 animate-fade-in animate-delay-[.4s]',
                        )
                    }
                >
                    {time}
                </div>
                <div
                    className={
                        classNames(
                            'text-xl text-helper3 animate-pop-in animate-delay-[1.2s]',
                            settings.lang === 'en-us' ? 'font-furore' : 'font-sans',
                        )
                    }
                >
                    {raisedLine}
                </div>
                <div
                    className={
                        classNames(
                            'text-4xl font-cantarell text-helper3 animate-fade-in animate-delay-[1.8s]',
                        )
                    }
                >
                    {amountLine}
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            {content}
        </div>
    );
}

export default InfoView;
