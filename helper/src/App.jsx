import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import colorConvert from 'color-convert';
import LiveContent from './components/LiveContent';
import logger from './modules/logger';
import PreviewContent from './components/PreviewContent';
import React from 'react';
import transparencyGrid from './assets/images/transparency-grid.png';
import useHelperSettings from './hooks/useHelperSettings';
import useTestContent from './hooks/useTestDonation';

const App = () => {
    const { i18n } = useTranslation();
    const [errorMessage, setErrorMessage] = useState(undefined);
    const helperSettings = useHelperSettings();
    const testContent = useTestContent(helperSettings.data);

    useEffect(() => {
        if (helperSettings?.error !== undefined) {
            setErrorMessage(helperSettings.error);
            return;
        }
    }, [helperSettings.error]);

    useEffect(() => {
        if (helperSettings?.data === undefined) {
            return;
        }

        if (i18n.language !== helperSettings.data.lang) {
            logger.debug(`Changing language from ${i18n.language} to ${helperSettings.data.lang}...`);
            i18n.changeLanguage(helperSettings.data.lang);
        }

        if (helperSettings.data.theme && !document.documentElement.classList.contains(helperSettings.data.theme)) {
            if (helperSettings.data.theme === 'custom') {
                logger.debug('Overriding theme colors with custom values...');
                for (let i = 1; i < 6; i++) {
                    const color = colorConvert.hex.hsl(helperSettings.data[`color${i}`]);
                    document.documentElement.style.setProperty(
                        `--twc-helper${i}`,
                        `${color[0]} ${color[1]}% ${color[2]}%`,
                    );
                }
            }

            logger.debug('Applying theme...');
            document.documentElement.classList.add(helperSettings.data.theme);
        }
    }, [helperSettings.data, helperSettings.error, i18n]);

    // If running in development mode and transparent background setting is enabled, show a transparency
    // grid background image to help visualize how elements will look against a transparent background.
    let containerStyle;
    if (import.meta.env.VITE_RUNTIME_MODE === 'DEV' && helperSettings.data?.isBackgroundTransparent) {
        containerStyle = {
            backgroundImage: `url(${transparencyGrid})`,
            backgroundRepeat: 'repeat',
        };
    }

    if (!helperSettings?.data) {
        return null;
    }

    let content;
    if (testContent !== null) {
        content = testContent;
    } else if (!['', 'general'].includes(helperSettings.data.previewMode)) {
        content = (
            <PreviewContent
                settings={helperSettings.data}
                errorMessage={errorMessage}
            />
        );
    } else {
        content = (
            <LiveContent
                settings={helperSettings.data}
                errorMessage={errorMessage}
            />
        );
    }

    return (
        <div
            className={
                classNames(
                    'w-full flex h-[80px]',
                    helperSettings.data?.border === 'square' ? 'border-2 border-helper1' : '',
                    helperSettings.data?.border === 'rounded' ? 'border-2 border-helper1 rounded-2xl' : '',
                    helperSettings.data?.isBackgroundTransparent ? 'bg-none' : 'bg-helper5',
                )
            }
            style={containerStyle}
        >
            {content}
        </div>
    );
};

export default App;
