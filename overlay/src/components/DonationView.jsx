import alertSfx from '../assets/audio/alert.mp3';
import classNames from 'classnames';
import Money from './Money';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

function DonationView ({ donation, onDonationAlertEnded, settings }) {
    const [, { sound }] = useSound(alertSfx);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onDonationAlertEnded();
        }, import.meta.env.VITE_DONATION_TTL);

        return () => {
            clearInterval(timeoutId);
        };
    }, [donation, onDonationAlertEnded]);

    useEffect(() => {
        if (!sound || !donation) {
            return;
        }

        sound.volume(settings.volume);
        sound.play();
    }, [donation, settings, sound]);

    let message;
    if (donation.message) {
        message = (
            <div className='text-helper3 text-[16px] text-center px-4 mt-4'>
                {donation.message}
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='leading-none font-cantarell text-helper4 whitespace-nowrap text-[74px]'>
                <Money
                    amount={donation.amount}
                    areCentsVisible={true}
                    format={settings.moneyFormat}
                />
            </div>
            <div
                className={
                    classNames(
                        'text-helper3 whitespace-nowrap',
                        donation.displayName.length === donation.displayName.normalize('NFD').length
                            ? 'font-furore text-[34px]'
                            : 'font-sans text-[34px] mt-2',
                    )
                }
            >
                {donation.displayName}
            </div>
            {message}
        </div>
    );
}

export default DonationView;
