import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import MoneyDisplay from './MoneyDisplay';
import React from 'react';

const LatestDonationsView = ({ latestDonations, settings }) => {
    const { t } = useTranslation();

    if (!settings) {
        return;
    }

    const donations = latestDonations.slice(0, 5).map((donation, index) => (
        <div
            key={donation.donationID}
            className={
                `text-helper3 font-cantarell text-[20px] animate-fade-in flex w-full rounded-full
                border border-helper1 leading-none relative`
            }
            style={{
                animationDelay: `${(index + 1) * .2}s`,
            }}
        >
            <div className='z-0 absolute w-full rounded-full h-full bg-helper5 brightness-75'>

            </div>
            <div className='z-10 w-full whitespace-nowrap pl-2 py-1.5'>
                {donation.displayName}
            </div>
            <div className='z-10 pr-2 flex justify-end items-center'>
                <MoneyDisplay
                    amount={donation.amount}
                    areCentsVisible={true}
                    format={settings.moneyFormat}
                />
            </div>
        </div>
    ));

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
                {t('LATEST_DONATIONS')}
            </div>
            <div className='flex flex-col items-center w-full space-y-1.5'>
                {donations}
            </div>
        </div>
    );
};

export default React.memo(LatestDonationsView);
