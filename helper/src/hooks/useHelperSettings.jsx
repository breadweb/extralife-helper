import { DateTime } from 'luxon';
import { isParamValueTrue } from '../modules/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Joi from 'joi';
import logger from '../modules/logger';

const themeOptions = ['blue1', 'blue2', 'gray1', 'white1', 'custom'];
const borderOptions = ['none', 'rounded', 'square'];
const langOptions = ['en', 'fr', 'es'];
const moneyFormatOptions = ['standard', 'fancy'];
const progressFormatOptions = ['raisedOnly', 'raisedAndGoal', 'progressBar'];
const voiceOptions = [
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

const getListItemFromParam = (urlParams, paramName, options, defaultIndex) => {
    const index = urlParams.get(paramName);
    if (index !== null && index >= 0 && index < options.length) {
        return options[index];
    } else {
        return defaultIndex !== undefined ? options[defaultIndex] : '';
    }
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
        isLatestDonationsEnabled: urlParams.get('d') === '1',
        areDonationAlertsEnabled: urlParams.get('a') === '1',
        areMilestoneAlertsEnabled: urlParams.get('e') === '1',
        isConfettiEnabled: urlParams.get('f') === '1',
        isRaisedLinePlural: urlParams.get('p') === '1',
        areMilestoneMarkersVisible: urlParams.get('k') === '1',
        areCentsVisible: urlParams.get('n') === '1',
        moneyFormat: getListItemFromParam(urlParams, 'm', moneyFormatOptions, 0),
        isYearModeEnabled: urlParams.get('y') === '1',
        voice: urlParams.get('v') === '-1' ? '' : getListItemFromParam(urlParams, 'v', voiceOptions),
        volume: urlParams.get('vo'),
        lang: urlParams.get('l') || langOptions[0],
        areMetricsEnabled: urlParams.get('i') === '1',
    };

    // The previous Helper supported two progress displays with the 'isGoalVisible' flag. Use that
    // to pick from the new list of display options if the new display option is not provided.
    settings.progressFormat = urlParams.has('pd')
        ? getListItemFromParam(urlParams, 'pd', progressFormatOptions)
        : urlParams.get('g') === '1' ? 'raisedAndGoal' : 'raisedOnly';

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
        isLatestDonationsEnabled: window.isLatestDonationsEnabled,
        areDonationAlertsEnabled: window.areDonationAlertsEnabled,
        areMilestoneAlertsEnabled: window.areMilestoneAlertsEnabled,
        isConfettiEnabled: window.isConfettiEnabled,
        isRaisedLinePlural: window.isRaisedLinePlural,
        progressFormat: window.progressFormat,
        areMilestoneMarkersVisible: window.areMilestoneMarkersVisible,
        areCentsVisible: window.areCentsVisible,
        moneyFormat: window.moneyFormat,
        isYearModeEnabled: window.isYearModeEnabled,
        voice: window.voice,
        volume: window.volume,
        lang: window.lang,
        areMetricsEnabled: window.areMetricsEnabled,
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
        isLatestDonationsEnabled: envVars.VITE_IS_LATEST_DONATIONS_ENABLED,
        areDonationAlertsEnabled: envVars.VITE_ARE_DONATION_ALERTS_ENABLED,
        areMilestoneAlertsEnabled: envVars.VITE_ARE_MILESTONE_ALERTS_ENABLED,
        isConfettiEnabled: envVars.VITE_IS_CONFETTI_ENABLED,
        isRaisedLinePlural: envVars.VITE_IS_RAISED_LINE_PLURAL,
        progressFormat: envVars.VITE_PROGRESS_FORMAT,
        areMilestoneMarkersVisible: envVars.VITE_ARE_MILESTONE_MARKERS_VISIBLE,
        areCentsVisible: envVars.VITE_ARE_CENTS_VISIBLE,
        moneyFormat: envVars.VITE_MONEY_FORMAT,
        isYearModeEnabled: envVars.VITE_IS_YEAR_MODE_ENABLED,
        voice: envVars.VITE_VOICE,
        volume: envVars.VITE_VOLUME,
        lang: envVars.VITE_LANG,
        areMetricsEnabled: envVars.VITE_ARE_METRICS_ENABLED,
    };
};

const colorSchema = Joi.when('theme', {
    is: 'custom',
    then: Joi.string().pattern(colorPattern).required(),
    otherwise: Joi.string().allow(null, ''),
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
    isLatestDonationsEnabled: Joi.boolean().required(),
    areDonationAlertsEnabled: Joi.boolean().required(),
    areMilestoneAlertsEnabled: Joi.boolean().required(),
    isConfettiEnabled: Joi.boolean().required(),
    isRaisedLinePlural: Joi.boolean().required(),
    progressFormat: Joi.string().valid(...progressFormatOptions).required(),
    areMilestoneMarkersVisible: Joi.boolean().required(),
    areCentsVisible: Joi.boolean().required(),
    moneyFormat: Joi.string().valid(...moneyFormatOptions).required(),
    isYearModeEnabled: Joi.boolean().required(),
    voice: Joi.string().valid(...voiceOptions).allow('').required(),
    volume: Joi.number().min(0).max(100).required(),
    lang: Joi.string().valid(...langOptions).required(),
    areMetricsEnabled: Joi.boolean().required(),
});

const useHelperSettings = () => {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(undefined);
    const { t } = useTranslation();

    useEffect(() => {
        let settings;
        switch (import.meta.env.VITE_RUNTIME_MODE) {
            case 'DEV':
                // When previewing in the Vite server during local development, settings will be loaded
                // from the environment variables contained in the .env.local file. If it does not exist,
                // create it using the contents from the .env.local.example file.
                settings = getSettingsFromEnvVars();
                break;
            case 'LOCAL':
                // When compiled into a single HTML file for running in a participant's browser from
                // the local file system, settings will be read from the global window object. The
                // settings are exposed at the top of the HTML file so users can easily modify them.
                settings = getSettingsFromGlobal();
                break;
            case 'REMOTE':
                // When running on https://extralife-helper.breadweb.net the settings are provided by
                // querystring parameters. Users are expected to generate the full URL with querystring
                // parameters using the link generator hosted at https://breadweb.net/extralife-helper/
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
            errorMessage = t('KEY_IS_INVALID', {
                settingName: key,
                message,
                interpolation: { 'escapeValue': false },
            });
        }

        if (settings.participantId && settings.teamId) {
            errorMessage = t('ONLY_ONE_ID');
        }

        if (errorMessage) {
            logger.error(`Settings are invalid. Details: ${errorMessage}`);
            setError(errorMessage);
        }

        settings.isBackgroundTransparent = isParamValueTrue(settings.isBackgroundTransparent);
        settings.isLatestDonationsEnabled = isParamValueTrue(settings.isLatestDonationsEnabled);
        settings.areDonationAlertsEnabled = isParamValueTrue(settings.areDonationAlertsEnabled);
        settings.areMilestoneAlertsEnabled = isParamValueTrue(settings.areMilestoneAlertsEnabled);
        settings.isConfettiEnabled = isParamValueTrue(settings.isConfettiEnabled);
        settings.isRaisedLinePlural = isParamValueTrue(settings.isRaisedLinePlural);
        settings.areMilestoneMarkersVisible = isParamValueTrue(settings.areMilestoneMarkersVisible);
        settings.areCentsVisible = isParamValueTrue(settings.areCentsVisible);
        settings.isYearModeEnabled = isParamValueTrue(settings.isYearModeEnabled);
        settings.areMetricsEnabled = isParamValueTrue(settings.areMetricsEnabled);
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
};

export default useHelperSettings;
