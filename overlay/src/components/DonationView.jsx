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

    return (
        <div className='flex flex-col items-center justify-center'>
            <div
                className={
                    classNames(
                        'leading-none font-cantarell text-helper4 whitespace-nowrap',
                        'text-[64px]',
                    )
                }
            >
                <Money
                    amount={donation.amount}
                    areCentsVisible={true}
                    format={settings.moneyFormat}
                />
            </div>
        </div>
    );
}

export default DonationView;
