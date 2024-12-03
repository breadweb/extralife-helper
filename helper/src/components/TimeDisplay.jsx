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

    let timerLine = t('HOURS_PLAYED');
    let time = '00:00:00';

    if (timer) {
        if (settings.isYearModeEnabled) {
            timerLine = t(`YEAR_MODE_TITLE_${settings.yearModeTitleOption}`);
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
    }

    return (
        <div className='flex items-center space-x-4'>
            <div
                className={
                    classNames(
                        'text-[24px] text-helper3 text-center leading-none whitespace-pre-line',
                        settings.lang === 'en' ? 'font-furore' : 'font-cantarell',
                        timerLine === '' ? 'opacity-0' : 'animate-fade-in',
                    )
                }
            >
                {timerLine}
            </div>
            <div
                className={
                    classNames(
                        'text-[42px] leading-none whitespace-nowrap font-digital text-helper4',
                        time === '00:00:00' ? 'opacity-0' : 'animate-fade-in animate-delay-[.4s]',
                    )
                }
            >
                {time}
            </div>
        </div>
    );
};

export default React.memo(TimeDisplay);
