import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import MoneyDisplay from './MoneyDisplay';

const MilestoneView = ({ milestone, onMilestoneAlertEnded, settings }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onMilestoneAlertEnded();
        }, import.meta.env.VITE_MILESTONE_TTL);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [milestone, onMilestoneAlertEnded]);

    return (
        <div className='flex flex-col justify-center items-center w-full mx-7'>
            <div
                className={
                    classNames(
                        'text-[30px] mb-4 text-helper3 whitespace-nowrap animate-pop-in leading-none',
                        settings.lang === 'en-us' ? 'font-furore' : 'font-cantarell',
                    )
                }
            >
                {t('MILESTONE_COMPLETED')}
            </div>
            <div
                className={
                    'text-helper3 flex flex-col items-center mb-4 animate-fade-in animate-delay-[.8s]'
                }
            >
                &quot;
                {milestone.description}
                &quot;
            </div>
            <div
                className={
                    `leading-none font-cantarell text-helper4 whitespace-nowrap text-[42px]
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
                    `text-helper3 flex flex-col items-center w-full text-[12px] font-cantarell
                    animate-fade-in animate-delay-[1.6s]`
                }
            >
                {t('RAISED')}
            </div>
        </div>
    );
};

export default React.memo(MilestoneView);
