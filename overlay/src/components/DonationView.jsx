import { confetti } from '@tsparticles/confetti';
import alertSfx from '../assets/audio/alert.mp3';
import classNames from 'classnames';
import confettiImage from '../assets/images/confetti.png';
import React, { useEffect } from 'react';
import useSound from 'use-sound';
import MoneyDisplay from './MoneyDisplay';

const DonationView = ({ donation, onDonationAlertEnded, settings }) => {
    const [, { sound }] = useSound(alertSfx);

    console.log('Render DonationView');

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

        const defaults = {
            spread: 360,
            ticks: 50,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            shapes: ['star'],
            colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
            origin: {
                y: 0.4,
            },
        };

        const fireConfetti = () => {
            if (!settings.isConfettiEnabled) {
                return;
            }

            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 2.2,
                shapes: ['image'],
                shapeOptions: {
                    image: [
                        {
                            src: confettiImage,
                            width: 32,
                            height: 32,
                        },
                    ],
                },
            });

            confetti({
                ...defaults,
                particleCount: 10,
                scalar: 1.55,
                shapes: ['circle'],
            });
        };

        const confettiTimeout1 = setTimeout(fireConfetti, 100);
        const confettiTimeout2 = setTimeout(fireConfetti, 200);
        const confettiTimeout3 = setTimeout(fireConfetti, 300);

        sound.volume(settings.volume);
        sound.play();

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

        return () => {
            window.responsiveVoice?.cancel();
            clearInterval(confettiTimeout1);
            clearInterval(confettiTimeout2);
            clearInterval(confettiTimeout3);
            clearInterval(textToSpeechTimeout);
        };
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
                        donation.displayName.length === donation.displayName.normalize('NFD').length
                            ? 'font-furore text-[34px]'
                            : 'font-sans text-[34px] font-bold',
                    )
                }
            >
                {donation.displayName}
            </div>
            {message}
        </div>
    );
};

export default React.memo(DonationView);
