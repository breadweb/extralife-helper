import { DateTime } from 'luxon';
import { isParamValueTrue } from '../modules/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joi from 'joi';
import logger from '../modules/logger';

const themeOptions = ['blue1', 'blue2', 'gray1', 'white1'];
const borderOptions = ['rounded', 'square', 'none'];
const voiceOptions = ['US-male', 'US-female', 'UK-male', 'UK-female', 'FR-male', 'FR-female', 'ES-male', 'ES-female'];
const langOptions = ['en-us', 'fr-ca', 'es-419'];

const datePattern = new RegExp('\\d{1,2}/\\d{1,2}/\\d{4}');
const timePattern = new RegExp('\\d{1,2}:\\d{1,2}:\\d{2}');

const getListItemFromParam = (urlParams, paramName, options) => {
    const index = urlParams.get(paramName);
    return index !== undefined && index >= 0 && index < options.length ? options[index] : '';
};

const getSettingsFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const settings = {
        participantId: urlParams.get('pid'),
        teamId: urlParams.get('tid'),
        theme: getListItemFromParam(urlParams, 't', themeOptions),
        border: getListItemFromParam(urlParams, 'b', borderOptions),
        areAlertsEnabled: urlParams.get('g') === '1',
        isRaisedLinePlural: urlParams.get('p') === '1',
        isGoalVisible: urlParams.get('a') === '1',
        areCentsVisible: urlParams.get('c') === '1',
        isYearModeEnabled: urlParams.get('y') === '1',
        voice: getListItemFromParam(urlParams, 'v', voiceOptions),
        volume: urlParams.get('vo'),
        lang: urlParams.get('l') || langOptions[0],
    };

    // The start date and time is a unix timestamp when provided through querystring parameters.
    // Convert to date and time strings that can be validated the same as when the value is provided
    // from the global window object or environment variables.
    const timestamp = urlParams.get('st');
    if (isFinite(timestamp)) {
        const dt = DateTime.fromMillis(parseInt(timestamp));
        settings.startDate = dt.toLocaleString(DateTime.DATE_SHORT);
        settings.startTime = dt.toLocaleString(DateTime.TIME_24_WITH_SECONDS);
    }

    return settings;
};

const getSettingsFromGlobal = () => {
    return {
        participantId: window.participantId,
        teamId: window.teamId,
        startDate: window.startDate,
        startTime: window.startTime,
        theme: window.theme,
        border: window.border,
        areAlertsEnabled: window.areAlertsEnabled,
        isRaisedLinePlural: window.isRaisedLinePlural,
        isGoalVisible: window.isGoalVisible,
        areCentsVisible: window.areCentsVisible,
        isYearModeEnabled: window.isYearModeEnabled,
        voice: window.voice,
        volume: window.volume,
        lang: window.lang,
    };
};

const getSettingsFromEnvVars = () => {
    const envVars = import.meta.env;
    return {
        participantId: envVars.VITE_PARTICIPANT_ID,
        teamId: envVars.VITE_TEAM_ID,
        startDate: envVars.VITE_START_DATE,
        startTime: envVars.VITE_START_TIME,
        theme: envVars.VITE_THEME,
        border: envVars.VITE_BORDER,
        areAlertsEnabled: envVars.VITE_ARE_ALERTS_ENABLED,
        isRaisedLinePlural: envVars.VITE_IS_RAISED_LINE_PLURAL,
        isGoalVisible: envVars.VITE_IS_GOAL_VISIBLE,
        areCentsVisible: envVars.VITE_ARE_CENTS_VISIBLE,
        isYearModeEnabled: envVars.VITE_IS_YEAR_MODE_ENABLED,
        voice: envVars.VITE_VOICE,
        volume: envVars.VITE_VOLUME,
        lang: envVars.VITE_LANG,
    };
};

const schema = Joi.object({
    participantId: Joi.string().allow('').required(),
    teamId: Joi.string().allow('').required(),
    startDate: Joi.string().pattern(datePattern).required(),
    startTime: Joi.string().pattern(timePattern).required(),
    theme: Joi.string().valid(...themeOptions).required(),
    border: Joi.string().valid(...borderOptions).required(),
    areAlertsEnabled: Joi.boolean().required(),
    isRaisedLinePlural: Joi.boolean().required(),
    isGoalVisible: Joi.boolean().required(),
    areCentsVisible: Joi.boolean().required(),
    isYearModeEnabled: Joi.boolean().required(),
    voice: Joi.string().valid(...voiceOptions).required(),
    volume: Joi.number().min(0).max(100).required(),
    lang: Joi.string().valid(...langOptions).required(),
});

function useHelperSettings () {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(undefined);
    const { t } = useTranslation();

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
        let errorMessage;

        if (validationResult.error) {
            const key = validationResult.error.details[0].context.key;
            const message = validationResult.error.details[0].message;
            errorMessage = t('KEY_IS_INVALID', { key, message, interpolation: { 'escapeValue': false } });
        }

        if (settings.participantId && settings.teamId) {
            errorMessage = t('ONLY_ONE_ID');
        }

        if (errorMessage) {
            logger.error(`Settings are invalid. Details: ${errorMessage}`);
            setError(errorMessage);
            return;
        }

        settings.areAlertsEnabled = isParamValueTrue(settings.areAlertsEnabled);
        settings.isRaisedLinePlural = isParamValueTrue(settings.isRaisedLinePlural);
        settings.isGoalVisible = isParamValueTrue(settings.isGoalVisible);
        settings.areCentsVisible = isParamValueTrue(settings.areCentsVisible);
        settings.isYearModeEnabled = isParamValueTrue(settings.isYearModeEnabled);
        settings.volume = parseInt(settings.volume) / 100;

        const dateParts = settings.startDate.split('/');
        const timeParts = settings.startTime.split(':');
        settings.startDateTime = DateTime.fromObject({
            year: parseInt(dateParts[2]),
            month: parseInt(dateParts[0]),
            day: parseInt(dateParts[1]),
            hour: parseInt(timeParts[0]),
            minute: parseInt(timeParts[1]),
            second: parseInt(timeParts[2]),
        });

        setData(settings);
    }, [t]);

    return {
        data: data,
        error: error,
    };
}

export default useHelperSettings;