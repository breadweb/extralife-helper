import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import donationAlert from '../assets/audio/donation-alert.mp3';
import logger from '../modules/logger';
import MoneyDisplay from './MoneyDisplay';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const DonationView = ({ donation, onDonationAlertEnded, settings }) => {
    const { t } = useTranslation();
    const [playAlert, { duration }] = useSound(donationAlert, { volume: settings?.volume || 0 });

    useEffect(() => {
        let didCallbackTimeoutFire = false;

        logger.debug('Setting donation alert timeout...');

        const timeoutId = setTimeout(() => {
            didCallbackTimeoutFire = true;
            if (onDonationAlertEnded) {
                onDonationAlertEnded();
            }
        }, import.meta.env.VITE_DONATION_TTL);

        const textToSpeechTimeoutId = setTimeout(() => {
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
            clearTimeout(timeoutId);
            clearTimeout(textToSpeechTimeoutId);
            window.responsiveVoice?.cancel();
            if (settings.isConfettiEnabled) {
                confetti.stop();
            }

            // If this component is dismounted before the timer fires, the parent still needs to
            // be notified.
            if (!didCallbackTimeoutFire && onDonationAlertEnded) {
                onDonationAlertEnded();
            }
        };
    }, [donation, onDonationAlertEnded, settings]);

    useEffect(() => {
        if (!duration) {
            return;
        }

        playAlert();

    }, [donation, duration, playAlert]);

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

    // Ensure the display of the donation amount is as large as possible.
    const amountLength = donation.amount.toString().length;
    const isFancy = settings.moneyFormat === 'fancy';
    let textSize;
    if (amountLength > 7) {
        textSize = isFancy ? 'text-[74px]' : 'text-[66px]';
    } else if (amountLength > 6) {
        textSize = isFancy ? 'text-[86px]' : 'text-[72px]';
    } else if (amountLength > 5) {
        textSize = isFancy ? 'text-[96px]' : 'text-[78px]';
    } else {
        textSize = isFancy ? 'text-[100px]' : 'text-[92px]';
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            {recipient}
            <div
                className={
                    classNames(
                        'leading-none font-cantarell text-helper4 whitespace-nowrap',
                        textSize,
                    )
                }
            >
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
