import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import LoadingSpinner from './LoadingSpinner';
import Money from './Money';
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

        const raised = (
            <Money
                amount={data.sumDonations + data.sumPledges}
                areCentsVisible={settings.areCentsVisible}
                format={settings.moneyFormat}
            />
        );
        let goal;
        if (settings.isGoalVisible) {
            goal = (
                <>
                    <div>/</div>
                    <Money
                        amount={data.fundraisingGoal}
                        areCentsVisible={settings.areCentsVisible}
                        format={settings.moneyFormat}
                    />
                </>
            );
        }

        content = (
            <>
                <div
                    className={
                        classNames(
                            'text-[20px] -mb-1 text-helper3 whitespace-nowrap animate-pop-in',
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
                            settings.isGoalVisible
                                ? settings.moneyFormat === 'fancy' ? 'text-[38px] mt-1' : 'text-[30px] mt-1'
                                : settings.moneyFormat === 'fancy' ? 'text-[62px]' : 'text-[54px]',
                            'flex space-x-2',
                        )
                    }
                >
                    {raised}{goal}
                </div>
            </>
        );
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            {content}
        </div>
    );
}

export default InfoView;
