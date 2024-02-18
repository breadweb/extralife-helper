import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
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
        let title;
        let time;

        if (settings.isYearModeEnabled) {
            title = t('MAIN_TITLE');
            time = DateTime.now().toFormat('yyyy');
        } else {
            if (timer.ms < 0) {
                if (timer.ms < -FOUR_DAYS_IN_MS) {
                    title = t('DAYS_UNTIL');
                    time = Math.ceil(timer.ms / ONE_DAY_IN_MS) * -1;
                } else {
                    title = t('HOURS_UNTIL');
                    time = timer.clock;
                }
            } else {
                title = t('HOURS_PLAYED');
                time = timer.clock;
            }
        }

        content = (
            <>
                <div>
                    {title}
                </div>
                <div className='text-6xl font-roboto mt-2'>
                    {time}
                </div>
            </>
        )
    }

    return (
        <div className='bg-zinc-200 w-full h-full flex flex-col items-center justify-center'>
            {content}
        </div>
    );
}

export default InfoView;
