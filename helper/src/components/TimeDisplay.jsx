import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import React from 'react';
import useTimer from '../hooks/useTimer';

const ONE_DAY_IN_MS = 86400000;
const FOUR_DAYS_IN_MS = ONE_DAY_IN_MS * 4;

const TimeDisplay = ({ settings }) => {
    const timer = useTimer(settings?.startDateTime);
    const { t } = useTranslation();

    let timerLine = '';
    let time = '00:00:00';

    if (timer) {
        if (settings.isYearModeEnabled) {
            timerLine = (
                <Trans i18nKey={`YEAR_MODE_TITLE_${settings.yearModeTitleOption}`} />
            );
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
        <>
            <div
                className={
                    classNames(
                        'text-[22px] -mb-1 text-helper3 text-center leading-none',
                        settings.lang === 'en' ? 'font-furore' : 'font-cantarell',
                        timerLine === '' ? 'opacity-0' : 'animate-pop-in',
                    )
                }
            >
                {timerLine}
            </div>
            <div
                className={
                    classNames(
                        'text-[92px] leading-none whitespace-nowrap font-digital text-helper4 -mb-2',
                        time === '00:00:00' ? 'opacity-0' : 'animate-fade-in animate-delay-[.4s]',
                    )
                }
            >
                {time}
            </div>
        </>
    );
};

export default React.memo(TimeDisplay);
