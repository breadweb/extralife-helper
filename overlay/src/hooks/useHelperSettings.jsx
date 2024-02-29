import { DateTime } from 'luxon';
import { isParamValueTrue } from '../modules/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joi from 'joi';
import logger from '../modules/logger';

const themeOptions = ['blue1', 'blue2', 'gray1', 'white1', 'custom'];
const borderOptions = ['rounded', 'square', 'none'];
const langOptions = ['en-us', 'fr-ca', 'es-419'];
const moneyFormatOptions = ['standard', 'fancy'];
const voiceOptions = [
    'none',
    'us-male',
    'us-female',
    'uk-male',
    'uk-female',
    'fr-male',
    'fr-female',
    'es-male',
    'es-female',
];

const voiceNames = {
    '': '',
    'us-male': 'US English Male',
    'us-female': 'US English Female',
    'uk-male': 'UK English Male',
    'uk-female': 'UK English Female',
    'fr-male': 'French Canadian Male',
    'fr-female': 'French Canadian Female',
    'es-male': 'Spanish Latin American Male',
    'es-female': 'Spanish Latin American Female',
};

const datePattern = new RegExp(/\d{1,2}\/\d{1,2}\/\d{4}/);
const timePattern = new RegExp(/\d{1,2}:\d{1,2}:\d{2}/);
const colorPattern = new RegExp(/[A-Fa-f0-9]{6}/);

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
        color1: urlParams.get('c1'),
        color2: urlParams.get('c2'),
        color3: urlParams.get('c3'),
        color4: urlParams.get('c4'),
        color5: urlParams.get('c5'),
        border: getListItemFromParam(urlParams, 'b', borderOptions),
        isBackgroundTransparent: urlParams.get('k') === '1',
        areAlertsEnabled: urlParams.get('g') === '1',
        isRaisedLinePlural: urlParams.get('p') === '1',
        isGoalVisible: urlParams.get('a') === '1',
        areCentsVisible: urlParams.get('n') === '1',
        moneyFormat: getListItemFromParam(urlParams, 'm', moneyFormatOptions),
        isYearModeEnabled: urlParams.get('y') === '1',
        voice: urlParams.get('v') === -1 ? '' : getListItemFromParam(urlParams, 'v', voiceOptions),
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
        color1: window.color1.replace('#', ''),
        color2: window.color2.replace('#', ''),
        color3: window.color3.replace('#', ''),
        color4: window.color4.replace('#', ''),
        color5: window.color5.replace('#', ''),
        border: window.border,
        isBackgroundTransparent: window.isBackgroundTransparent,
        areAlertsEnabled: window.areAlertsEnabled,
        isRaisedLinePlural: window.isRaisedLinePlural,
        isGoalVisible: window.isGoalVisible,
        areCentsVisible: window.areCentsVisible,
        moneyFormat: window.moneyFormat,
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
        color1: envVars.VITE_COLOR1,
        color2: envVars.VITE_COLOR2,
        color3: envVars.VITE_COLOR3,
        color4: envVars.VITE_COLOR4,
        color5: envVars.VITE_COLOR5,
        border: envVars.VITE_BORDER,
        isBackgroundTransparent: envVars.VITE_IS_BACKGROUND_TRANSPARENT,
        areAlertsEnabled: envVars.VITE_ARE_ALERTS_ENABLED,
        isRaisedLinePlural: envVars.VITE_IS_RAISED_LINE_PLURAL,
        isGoalVisible: envVars.VITE_IS_GOAL_VISIBLE,
        areCentsVisible: envVars.VITE_ARE_CENTS_VISIBLE,
        moneyFormat: envVars.VITE_MONEY_FORMAT,
        isYearModeEnabled: envVars.VITE_IS_YEAR_MODE_ENABLED,
        voice: envVars.VITE_VOICE,
        volume: envVars.VITE_VOLUME,
        lang: envVars.VITE_LANG,
    };
};

const colorSchema = Joi.when('theme', {
    is: 'custom',
    then: Joi.string().pattern(colorPattern).required(),
    otherwise: Joi.string().allow(''),
});

const schema = Joi.object({
    participantId: Joi.string().allow('').required(),
    teamId: Joi.string().allow('').required(),
    startDate: Joi.string().pattern(datePattern).required(),
    startTime: Joi.string().pattern(timePattern).required(),
    theme: Joi.string().valid(...themeOptions).required(),
    color1: colorSchema,
    color2: colorSchema,
    color3: colorSchema,
    color4: colorSchema,
    color5: colorSchema,
    border: Joi.string().valid(...borderOptions).required(),
    isBackgroundTransparent: Joi.boolean().required(),
    areAlertsEnabled: Joi.boolean().required(),
    isRaisedLinePlural: Joi.boolean().required(),
    isGoalVisible: Joi.boolean().required(),
    areCentsVisible: Joi.boolean().required(),
    moneyFormat: Joi.string().valid(...moneyFormatOptions).required(),
    isYearModeEnabled: Joi.boolean().required(),
    voice: Joi.string().valid(...voiceOptions).allow('').required(),
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

        settings.isBackgroundTransparent = isParamValueTrue(settings.isBackgroundTransparent);
        settings.areAlertsEnabled = isParamValueTrue(settings.areAlertsEnabled);
        settings.isRaisedLinePlural = isParamValueTrue(settings.isRaisedLinePlural);
        settings.isGoalVisible = isParamValueTrue(settings.isGoalVisible);
        settings.areCentsVisible = isParamValueTrue(settings.areCentsVisible);
        settings.isYearModeEnabled = isParamValueTrue(settings.isYearModeEnabled);
        settings.volume = parseInt(settings.volume) / 100;
        settings.voice = voiceNames[settings.voice];

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
