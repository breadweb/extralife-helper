import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import React from 'react';
import useTimer from '../hooks/useTimer';

const ONE_DAY_IN_MS = 86400000;
const FOUR_DAYS_IN_MS = ONE_DAY_IN_MS * 4;

const TimeDisplay = ({ settings }) => {
    const timer = useTimer(settings?.startDateTime);
    const { t } = useTranslation();

    if (!timer) {
        return;
    }

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

    return (
        <>
            <div
                className={
                    classNames(
                        'text-[20px] -mb-1 text-helper3 whitespace-nowrap animate-pop-in leading-none',
                        settings.lang === 'en-us' ? 'font-furore' : 'font-cantarell',
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
        </>
    );
};

export default React.memo(TimeDisplay);
