import { useEffect, useState } from 'react';
import useHelperSettings from './hooks/useHelperSettings';
import useExtraLifeData from './hooks/useExtraLifeData';
import useSound from 'use-sound';
import kaChingSfx from './assets/audio/ka-ching.mp3';

function App() {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const helperSettings = useHelperSettings();
    const extraLife = useExtraLifeData(undefined);
    const [playSound, { sound }] = useSound(kaChingSfx);

    useEffect(() => {
        const onKeyPress = evt => {
            switch (evt.key) {
                case 's':
                    sound.volume(helperSettings.data?.volume || 1);
                    sound.play();
                default:
                    // Do nothing.
            }
        };
        if (['DEV', 'LOCAL'].includes(import.meta.env.VITE_RUNTIME_MODE)) {
            document.addEventListener('keypress', onKeyPress);
        }
        return () => {
            document.removeEventListener('keypress', onKeyPress);
        };
    }, [playSound]);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }

        if (helperSettings?.data === undefined) {
            return;
        }

        extraLife.setRequestOptions(
            helperSettings.data.participantId ? 'participants' : 'teams',
            helperSettings.data.participantId || helperSettings.data.teamId,
        );
    }, [helperSettings.data, helperSettings.error]);

    if (errorMessage) {
        return (
            <div className='flex'>
                {errorMessage}
            </div>
        )
    }

    return (
        <div className='flex flex-col'>
            <div className='p-2'>
                Participant ID: {helperSettings?.data?.participantId}
            </div>
            <div className='font-mono p-2 text-sm whitespace-pre'>
                {JSON.stringify(helperSettings?.data, null, 2)}
            </div>
            <div className='font-mono p-2 text-sm whitespace-pre'>
                {JSON.stringify(extraLife.data, null, 2)}
            </div>
        </div>
    )
}

export default App
