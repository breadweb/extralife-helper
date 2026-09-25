import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import donationAlert from '../assets/audio/donation-alert.mp3';
import donationAlertJumpScare from '../assets/audio/donation-alert-jump-scare.mp3';
import logger from '../modules/logger';
import MoneyDisplay from './MoneyDisplay';
import oneEightSevenSeven from '../assets/audio/1877.mp3';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const synth = window.speechSynthesis;
let voices = [];
synth.addEventListener('voiceschanged', () => {
    voices = synth.getVoices();
});

const DonationView = ({ donation, onDonationAlertEnded, settings }) => {
    const { t } = useTranslation();
    const [playAlert, { duration }] = useSound(
        donationAlert,
        { volume: settings?.volume || 0 },
    );
    const [playAlertJumpScare, { duration: durationJumpScare }] = useSound(
        donationAlertJumpScare,
        { volume: settings?.volume || 0 },
    );
    const [playAlert1877, { duration: duration1877 } ] = useSound(
        oneEightSevenSeven,
        { volume: settings?.volume || 0 },
    );

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
            if (donation.message && settings.voice !== '' && synth) {
                const utterance = new SpeechSynthesisUtterance(donation.message);
                utterance.voice = voices.find(voice => voice.name === settings.voice);
                utterance.volume = settings.volume;
                if (!utterance.voice) {
                    logger.warning(
                        `The selected voice (${settings.voice}) is not avaialble on this computer. ` +
                        'Using the default voice.',
                    );
                }
                synth.speak(utterance);
            }
        }, import.meta.env.VITE_TTS_DELAY);

        if (settings.isConfettiEnabled) {
            confetti.start();
        }

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(textToSpeechTimeoutId);
            synth.cancel();
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
        if (!duration || !durationJumpScare || !duration1877) {
            return;
        }

        if (donation.amount.toString().replace('.', '').includes('1877')) {
            playAlert1877();
        } else if (donation.amount >= 25) {
            playAlertJumpScare();
        } else {
            playAlert();
        }

    }, [donation, duration, duration1877, durationJumpScare, playAlert, playAlert1877, playAlertJumpScare]);

    let message;
    if (donation.message) {
        message = (
            <div className='text-helper3 text-[16px] text-center'>
                {donation.message}
            </div>
        );
    }

    const displayName = donation.displayName !== undefined
        ? donation.displayName
        : t('ANONYMOUS');

    return (
        <div className='flex flex-col items-center w-full my-auto'>
            <div className='flex items-center space-x-4'>
                <div
                    className={
                        classNames(
                            'text-helper3 whitespace-nowrap',
                            displayName.length === displayName.normalize('NFD').length
                                ? 'font-furore text-[24px]'
                                : 'font-cantarell text-[24px] font-bold',
                        )
                    }
                >
                    {displayName}
                </div>
                <div className='leading-none font-cantarell text-helper4 whitespace-nowrap text-[32px]'>
                    <MoneyDisplay
                        amount={donation.amount}
                        areCentsVisible={true}
                        format={settings.moneyFormat}
                    />
                </div>
            </div>
            {message}
        </div>
    );
};

export default React.memo(DonationView);
