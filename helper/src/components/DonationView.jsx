import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import donationAlert from '../assets/audio/donation-alert.mp3';
import MoneyDisplay from './MoneyDisplay';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const DonationView = ({ donation, onDonationAlertEnded, settings }) => {
    const [playAlert] = useSound(donationAlert, { volume: settings?.volume || 0 });
    const { t } = useTranslation();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onDonationAlertEnded();
        }, import.meta.env.VITE_DONATION_TTL);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [donation, onDonationAlertEnded]);

    useEffect(() => {
        if (!playAlert || !donation) {
            return;
        }

        playAlert();

        const textToSpeechTimeout = setTimeout(() => {
            if (settings.voice !== '' && window.responsiveVoice) {
                window.responsiveVoice.speak(
                    donation.message,
                    settings.voice,
                    {
                        volume: settings.volume,
                    },
                );
            }
        }, import.meta.env.VITE_TTS_DELAY);

        if (settings.isConfettiEnabled) {
            confetti.start();
        }

        return () => {
            window.responsiveVoice?.cancel();
            clearTimeout(textToSpeechTimeout);
            if (settings.isConfettiEnabled) {
                confetti.stop();
            }
        };
    }, [donation, settings, playAlert]);

    let message;
    if (donation.message) {
        message = (
            <div className='text-helper3 text-[16px] text-center px-4 mt-4'>
                {donation.message}
            </div>
        );
    }

    let recipient;
    if (settings.teamId) {
        recipient = (
            <div className='text-helper3 flex justify-center w-full text-[16px] font-cantarell leading-none -mb-1'>
                {t('RECEIVED', { name: donation.recipientName }).toLocaleUpperCase()}
            </div>
        );
    }

    const displayName = donation.displayName !== undefined
        ? donation.displayName
        : t('ANONYMOUS');

    return (
        <div className='flex flex-col items-center justify-center'>
            {recipient}
            <div className='leading-none font-cantarell text-helper4 whitespace-nowrap text-[74px]'>
                <MoneyDisplay
                    amount={donation.amount}
                    areCentsVisible={true}
                    format={settings.moneyFormat}
                />
            </div>
            <div
                className={
                    classNames(
                        'text-helper3 whitespace-nowrap',
                        displayName.length === displayName.normalize('NFD').length
                            ? 'font-furore text-[34px]'
                            : 'font-cantarell text-[34px] font-bold',
                    )
                }
            >
                {displayName}
            </div>
            {message}
        </div>
    );
};

export default React.memo(DonationView);
