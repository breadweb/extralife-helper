import { Chat } from 'twitch-js';
import { serializeError } from '../modules/utils';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import donationAlert from '../assets/audio/donation-alert-jump-scare.mp3';
import logger from '../modules/logger';
import MoneyDisplay from './MoneyDisplay';
import oneEightSevenSeven from '../assets/audio/1877-creepy-mas.mp3';
import React, { useEffect } from 'react';
import useSound from 'use-sound';

const synth = window.speechSynthesis;
let voices = [];
synth.addEventListener('voiceschanged', () => {
    voices = synth.getVoices();
});

const sendTwitchChatMessage = async (donation) => {
    const chat = new Chat({
        username: 'bread4kids',
        token: import.meta.env.VITE_TWITCH_CHAT_PASSWORD,
        log: {
            level: 0,
        },
    });

    try {
        await chat.connect();
        await chat.join('bread4kids');

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        const amount = formatter.format(donation.amount);
        const name = donation.displayName !== undefined ? donation.displayName : 'Anonymous';
        const message = donation.message;
        const article = donation.amount.toString().startsWith('8') ? 'an' : 'a';
        const chatMessage = message
            ? `bread4Wings ${name} just made ${article} ${amount} Extra Life donation: "${message}" bread4ThankYou`
            : `bread4Wings ${name} just made ${article} ${amount} Extra Life donation! bread4ThankYou`;

        await chat.say('bread4kids', chatMessage);

        chat.disconnect();
    } catch (err) {
        logger.error(`Error sending Twitch chat message. Details: ${serializeError(err)}`);
    }
};

const flashLights = async () => {
    const addresses = [
        '192.168.1.173',
        '192.168.1.242',
    ];

    const users = [
        import.meta.env.VITE_HUE_BRIDGE_USER_1,
        import.meta.env.VITE_HUE_BRIDGE_USER_2,
    ];

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const user = users[i];
        const axiosOptions = {
            method: 'PUT',
            data: {
                alert: 'lselect',
            },
            url: `http://${address}/api/${user}/groups/1/action`,
        };
        try {
            await axios(axiosOptions);
        } catch (err) {
            logger.error(`Error making light request. Bridge: ${address}, Details: ${serializeError(err)}`);
        }
    }
};

const DonationView = ({ donation, onDonationAlertEnded, settings }) => {
    const { t } = useTranslation();
    const [playAlert, { duration }] = useSound(donationAlert, { volume: settings?.volume || 0 });
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

        // Make the HUE light groups flash.
        flashLights();

        // Post a message to Twitch chat.
        sendTwitchChatMessage(donation);

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
        if (!duration || !duration1877) {
            return;
        }

        if (donation.amount.toString().replace('.', '').includes('1877')) {
            playAlert1877();
        } else {
            playAlert();
        }

    }, [donation, duration, duration1877, playAlert, playAlert1877]);

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
