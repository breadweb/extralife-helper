import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import milestoneAlert from '../assets/audio/milestone-alert.mp3';
import MoneyDisplay from './MoneyDisplay';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const MilestoneView = ({ milestone, onMilestoneAlertEnded, settings }) => {
    const { t } = useTranslation();
    const [playAlert, { duration }] = useSound(milestoneAlert, { volume: settings?.volume || 0 });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onMilestoneAlertEnded();
        }, import.meta.env.VITE_MILESTONE_TTL);

        if (settings.isConfettiEnabled) {
            confetti.start();
        }

        return () => {
            clearTimeout(timeoutId);
            if (settings.isConfettiEnabled) {
                confetti.stop();
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
        <div className='flex flex-col justify-center items-center w-full mx-7'>
            <div
                className={
                    classNames(
                        'text-[30px] mb-4 text-helper3 whitespace-nowrap animate-pop-in leading-none',
                        settings.lang === 'en' ? 'font-furore' : 'font-cantarell',
                    )
                }
            >
                {t('MILESTONE_COMPLETED')}
            </div>
            <div
                className={
                    `text-helper3 flex flex-col items-center mb-4 animate-fade-in animate-delay-[.8s]
                    text-[20px]`
                }
            >
                &quot;
                {milestone.description}
                &quot;
            </div>
            <div
                className={
                    `leading-none font-cantarell text-helper4 whitespace-nowrap text-[60px]
                    animate-pop-in animate-delay-[1.2s]`
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
                    `text-helper3 flex flex-col items-center w-full text-[18px] font-cantarell
                    animate-fade-in animate-delay-[1.6s]`
                }
            >
                {t('RAISED')}
            </div>
        </div>
    );
};

export default React.memo(MilestoneView);
