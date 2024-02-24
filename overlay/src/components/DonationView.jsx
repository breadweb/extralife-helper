import alertSfx from '../assets/audio/alert.mp3';
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
    }, [onDonationAlertEnded]);

    useEffect(() => {
        if (settings?.volume === undefined || !sound) {
            return;
        }

        sound.volume(settings.volume);
        sound.play();
    }, [donation, settings, sound]);

    if (!donation) {
        return null;
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            {donation.donationID}
        </div>
    );
}

export default DonationView;
