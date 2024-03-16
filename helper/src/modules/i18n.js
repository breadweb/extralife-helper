import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../assets/locales/en';
import esTranslation from '../assets/locales/es';
import frTranslation from '../assets/locales/fr';

i18next
    .use(initReactI18next)
    .init({
        debug: import.meta.env.VITE_IS_DEBUG_LOGGING_ENABLED === 'true',
        fallbackLng: 'en',
        resources: {
            'en': {
                translation: enTranslation,
            },
            'es': {
                translation: esTranslation,
            },
            'fr': {
                translation: frTranslation,
            },
        },
    });

export default i18next;
