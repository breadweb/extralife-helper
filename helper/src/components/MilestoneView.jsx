import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import logger from '../modules/logger';
import milestoneAlert from '../assets/audio/milestone-alert.mp3';
import MoneyDisplay from './MoneyDisplay';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const MilestoneView = ({ milestone, onMilestoneAlertEnded, settings }) => {
    const { t } = useTranslation();
    const [playAlert, { duration }] = useSound(milestoneAlert, { volume: settings?.volume || 0 });

    useEffect(() => {
        let didCallbackTimeoutFire = false;

        logger.debug('Setting milestone alert timeout...');

        const timeoutId = setTimeout(() => {
            didCallbackTimeoutFire = true;
            if (onMilestoneAlertEnded) {
                onMilestoneAlertEnded();
            }
        }, import.meta.env.VITE_MILESTONE_TTL);

        if (settings.isConfettiEnabled) {
            confetti.start();
        }

        return () => {
            logger.debug('Dismounting milestone and clearing timer...');

            clearTimeout(timeoutId);

            if (settings.isConfettiEnabled) {
                confetti.stop();
            }

            // If this component is dismounted before the timer fires, the parent still needs to
            // be notified.
            if (!didCallbackTimeoutFire && onMilestoneAlertEnded) {
                onMilestoneAlertEnded();
            }
        };
    }, [milestone, onMilestoneAlertEnded, settings]);

    useEffect(() => {
        if (!duration) {
            return;
        }

        playAlert();

    }, [milestone, duration, playAlert]);

    return (
        <div className='flex flex-col items-center w-full my-auto space-y-1'>
            <div className='flex items-center space-x-2'>
                <div
                    className={
                        classNames(
                            'text-[24px] text-helper3 whitespace-nowrap animate-pop-in leading-none',
                            settings.lang === 'en' ? 'font-furore' : 'font-cantarell',
                        )
                    }
                >
                    {t('MILESTONE_COMPLETED')}
                </div>
                <div
                    className={
                        'leading-none font-cantarell text-helper4 whitespace-nowrap text-[32px]'
                    }
                >
                    <MoneyDisplay
                        amount={milestone.fundraisingGoal}
                        areCentsVisible={true}
                        format={settings.moneyFormat}
                    />
                </div>
                <div
                    className={
                        'text-helper3 flex flex-col items-center w-full text-[18px] font-cantarell'
                    }
                >
                    {t('RAISED')}
                </div>
            </div>
            <div
                className={
                    'text-helper3 flex flex-col items-center text-center leading-6 text-[16px]'
                }
            >
                &quot;
                {milestone.description}
                &quot;
            </div>
        </div>
    );
};

export default React.memo(MilestoneView);
