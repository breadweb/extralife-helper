import { Chat } from 'twitch-js';
import { serializeError } from '../modules/utils';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import classNames from 'classnames';
import confetti from '../modules/confetti';
import donationAlert from '../assets/audio/donation-alert.mp3';
import logger from '../modules/logger';
import MoneyDisplay from './MoneyDisplay';
import oneEightSevenSeven from '../assets/audio/1877.mp3';
import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';

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
        const name = donation.displayName;
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
    const [playAlert] = useSound(donationAlert, { volume: settings?.volume || 0 });
    const [play1877Alert] = useSound(oneEightSevenSeven, { volume: settings?.volume || 0 });
    const [wasHandled, setWasHandled] = useState(false);

    useEffect(() => {
        if (!onDonationAlertEnded) {
            return;
        }

        const timeoutId = setTimeout(() => {
            onDonationAlertEnded();
        }, import.meta.env.VITE_DONATION_TTL);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [donation, onDonationAlertEnded]);

    useEffect(() => {
        if (!playAlert || !play1877Alert || !donation || wasHandled) {
            return;
        }

        // Play the special 1-877-bread4kids jingle donation alert if the donation amount contains
        // 1877 anywhere in the donation amount.
        if (donation.amount.toString().replace('.', '').includes('1877')) {
            play1877Alert();
        } else {
            playAlert();
        }

        // Make the HUE light groups flash.
        flashLights();

        // Post a message to Twitch chat.
        sendTwitchChatMessage(donation);

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

        setWasHandled(true);

        return () => {
            window.responsiveVoice?.cancel();
            clearTimeout(textToSpeechTimeout);
            if (settings.isConfettiEnabled) {
                confetti.stop();
            }
        };
    }, [donation, settings, playAlert, play1877Alert, wasHandled]);

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
