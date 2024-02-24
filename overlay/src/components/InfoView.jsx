import { DateTime } from 'luxon';
import { getFormattedMoney } from '../modules/utils';
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

    if (!data || !timer) {
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

        let amountLine = getFormattedMoney(data.sumDonations + data.sumPledges, settings.areCentsVisible);
        if (settings.isGoalVisible) {
            amountLine += ' / ' + getFormattedMoney(data.fundraisingGoal, settings.areCentsVisible);
        }

        content = (
            <div className='flex flex-col items-center'>
                <div
                    className={
                        classNames(
                            'text-[20px] -mb-1 font-furore text-helper3 whitespace-nowrap animate-pop-in',
                            settings.lang === 'en-us' ? 'font-furore' : 'font-sans',
                        )
                    }
                >
                    {timerLine}
                </div>
                <div
                    className={
                        `text-[92px] leading-none whitespace-nowrap
                        font-digital text-helper4 animate-fade-in animate-delay-[.4s]`
                    }
                >
                    {time}
                </div>
                <div
                    className={
                        classNames(
                            'text-[20px] text-helper3 whitespace-nowrap animate-pop-in animate-delay-[1.2s]',
                            settings.lang === 'en-us' ? 'font-furore' : 'font-sans',
                        )
                    }
                >
                    {raisedLine}
                </div>
                <div
                    className={
                        classNames(
                            'leading-none font-cantarell text-helper3 whitespace-nowrap',
                            'animate-fade-in animate-delay-[1.8s]',
                            settings.isGoalVisible ? 'text-[32px] mt-1' : 'text-[48px]',
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
