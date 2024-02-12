import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import Joi from 'joi';

const datePattern = new RegExp('\\d{1,2}-\\d{2}-\\d{4}');
const timePattern = new RegExp('\\d{1,2}:\\d{2}:\\d{2}');

function useHelperSettings () {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(undefined);

    const getSettingsFromParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        // TODO: Convert timestamp to start date and time.
        // TODO: Add parsing of remaining values.
        return {
            participantId: urlParams.get('pid'),
            teamId: urlParams.get('tid'),
            volume: urlParams.get('vo'),
        };
    }

    const getSettingsFromGlobal = () => {
        // TODO: Add parsing of remaining values.
        return {
            participantId: window.participantId,
            teamId: window.teamId,
            volume: window.volume,
        };
    }

    const getSettingsFromEnvVars = () => {
        const envVars = import.meta.env;
        return {
            participantId: envVars.VITE_PARTICIPANT_ID,
            teamId: envVars.VITE_TEAM_ID,
            startDate: envVars.VITE_START_DATE,
            startTime: envVars.VITE_START_TIME,
            theme: envVars.VITE_THEME,
            border: envVars.VITE_BORDER,
            width: envVars.VITE_WIDTH,
            showAlerts: envVars.VITE_SHOW_ALERTS,
            showGoal: envVars.VITE_SHOW_GOAL,
            showYearMode: envVars.VITE_SHOW_YEAR_MODE,
            voice: envVars.VITE_VOICE,
            volume: envVars.VITE_VOLUME,
            lang: envVars.VITE_LANG,
        }
    }

    const schema = Joi.object({
        participantId: Joi.string().allow('').required(),
        teamId: Joi.string().allow('').required(),
        startDate: Joi.string().pattern(datePattern).required(),
        startTime: Joi.string().pattern(timePattern).required(),
        theme: Joi.string().valid('blue1', 'blue2', 'gray1', 'white1').required(),
        border: Joi.string().valid('rounded', 'square', 'none').required(),
        width: Joi.number().integer().min(320).max(3840).required(),
        showAlerts: Joi.boolean().required(),
        showGoal: Joi.boolean().required(),
        showYearMode: Joi.boolean().required(),
        voice: Joi.string().valid(
            'US-male', 'US-female', 'UK-male', 'UK-female', 'FR-male', 'FR-female', 'ES-male', 'ES-female'
        ).required(),
        volume: Joi.number().min(0).max(100).required(),
        lang: Joi.string().valid('en-us', 'fr-ca', 'es-419').required(),
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
            // TODO: Create friendly messages.
            const message = validationResult.error.details[0].message;
            console.log(`Settings are invalid. Details: ${message}`);
            setError(message);
            return;
        }

        if (settings.participantId && settings.teamId) {
            const message = 'A participant ID or team ID can be provided, but not both.';
            console.log(`Settings are invalid. Details: ${message}`);
            setError(message);
            return;
        }

        settings.volume = settings.volume / 100;
        settings.startDateTime = DateTime.fromSQL(
            `${settings.startDate} ${settings.startTime}`, { zone: 'utc' },
        );
        setData(settings);

    }, []);

    return {
        data: data,
        error: error,
    };
}

export default useHelperSettings;
