import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import LoadingSpinner from './LoadingSpinner';
import Progress from './Progress';
import React from 'react';
import useTimer from '../hooks/useTimer';

const ONE_DAY_IN_MS = 86400000;
const FOUR_DAYS_IN_MS = ONE_DAY_IN_MS * 4;

const InfoView = ({ data, settings }) => {
    const { t } = useTranslation();
    const timer = useTimer(settings?.startDateTime);

    if (!data || !timer) {
        return (
            <div className='animate-fade-in animate-delay-[1.8s] flex justify-center items-center w-full'>
                <LoadingSpinner />
            </div>
        );
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
            <div
                className={
                    `text-[20px] font-gilroy text-helper3 whitespace-nowrap leading-none mt-2
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
