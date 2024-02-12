import { useEffect, useState } from 'react';
import Joi from 'joi';

function useHelperSettings () {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(undefined);

    const getSettingsFromParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            participantId: urlParams.get('pid'),
            volume: urlParams.get('vo'),
        };
    }

    const getSettingsFromGlobal = () => {
        return {
            participantId: window.participantId,
            volume: window.volume,
        };
    }

    const getSettingsFromEnvVars = () => {
        const envVars = import.meta.env;
        return {
            participantId: envVars.VITE_PARTICIPANT_ID,
            volume: envVars.VITE_VOLUME,
        }
    }

    const schema = Joi.object({
        participantId: Joi.string().required(),
        volume: Joi.number().min(0).max(100).required(),
    });

    useEffect(() => {
        let settings;
        switch (import.meta.env.VITE_RUNTIME_MODE) {
            case 'DEV':
                settings = getSettingsFromEnvVars();
                break;
            case 'LOCAL':
                settings = getSettingsFromGlobal();
                break;
            case 'REMOTE':
                settings = getSettingsFromParams();
                break;
            default:
                setError('Unable to get settings.');
        }

        const validationResult = schema.validate(settings);

        if (validationResult.error) {
            const message = validationResult.error.details[0].message;
            console.log(`Settings are invalid. Details: ${message}`);
            setError(message);
        } else {
            settings.volume = settings.volume / 100;
            setData(settings);
        }
    }, []);

    return {
        data: data,
        error: error,
    };
}

export default useHelperSettings;
