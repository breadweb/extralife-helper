import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
    const config = {
        build: {
            emptyOutDir: true,
            outDir: '../dist',
        },
        content: [
            './src/index.html',
            './src/**/*.{js,jsx}',
        ],
        envDir: '../',
        plugins: [react()],
        root: 'src',
    };

    if (command === 'build') {
        config.base = `${process.env.BASE_URL}`;
        if (process.env.VITE_RUNTIME_MODE === 'LOCAL') {
            config.plugins.push(
                viteSingleFile(),
                helperSettings(),
            );
        }
    } else {
        config.base = '/';
        config.server = {
            port: '5173',
        };
    }

    return config;
});

const helperSettings = () => {
    return {
        name: 'add-helper-settings',
        enforce: 'post',
        generateBundle: (_, bundle) => {
            console.log('Adding Helper settings section...');            
            const htmlChunk = bundle['index.html'];
            htmlChunk.source = htmlChunk.source.replace(
                '</title>',
                `</title>\n${getSettingsContent()}`,
            );
        },
    };
};

const getSettingsContent = () => {
    const items = [
        [
            'participantId',
            process.env.VITE_PARTICIPANT_ID,
            true,
            'Set this to "" to run in team mode.',
        ],
        [
            'teamId',
            process.env.VITE_TEAM_ID,
            true,
            'Set this to "" to run in participant mode.',
        ],
        [
            'startDate',
            process.env.VITE_START_DATE,
            true,
            'Set to the date the Extra Life event starts using the local timezone.',
        ],
        [
            'startTime',
            process.env.VITE_START_TIME,
            true,
            'Set to the time the Extra Life event starts using a 24 hour clock and the local timezone.',
        ],
        [
            'theme',
            process.env.VITE_THEME,
            true,
            'Determines what color theme is used for the Helper. The four presets that can be used ' +
            'are "white1", "gray1", "blue1", or "blue2". If wanting to create a unique theme, set to ' +
            '"custom" and specify the five color values below.',
        ],
        [
            'color1',
            process.env.VITE_COLOR1,
            true,
            'If theme is set to "custom", this is the first hex color to use such as FF0000. ' +
            'Set to "" if using a theme preset.',
        ],
        [
            'color2',
            process.env.VITE_COLOR2,
            true,
            'If theme is set to "custom", this is the second hex color to use such as FF0000. ' +
            'Set to "" if using a preset theme.',
        ],
        [
            'color3',
            process.env.VITE_COLOR3,
            true,
            'If theme is set to "custom", this is the third hex color to use such as FF0000. ' +
            'Set to "" if using a preset theme.',
        ],
        [
            'color4',
            process.env.VITE_COLOR4,
            true,
            'If theme is set to "custom", this is the fourth hex color to use such as FF0000. ' +
            'Set to "" if using a preset theme.',
        ],
        [
            'color5',
            process.env.VITE_COLOR5,
            true,
            'If theme is set to "custom", this is the fifth hex color to use such as FF0000. ' +
            'Set to "" if using a preset theme.',
        ],
        [
            'border',
            process.env.VITE_BORDER,
            true,
            'Determines the style of the border. Options are "rounded", "square", or "none" to not ' +
            'show a border.',
        ],
        [
            'isBackgroundTransparent',
            process.env.VITE_IS_BACKGROUND_TRANSPARENT,
            false,
            'Set to true to set the background as transparent instead of a solid color.',
        ],
        [
            'isLatestDonationsEnabled',
            process.env.VITE_IS_LATEST_DONATIONS_ENABLED,
            false,
            'Set to true to occassionally show the last three donations received.',
        ],
        [
            'areDonationAlertsEnabled',
            process.env.VITE_ARE_DONATION_ALERTS_ENABLED,
            false,
            'Set to false to disable donation alerts.',
        ],
        [
            'areMilestoneAlertsEnabled',
            process.env.VITE_ARE_MILESTONE_ALERTS_ENABLED,
            false,
            'Set to true to enable completed milestone alerts.',
        ],
        [
            'isConfettiEnabled',
            process.env.VITE_IS_CONFETTI_ENABLED,
            false,
            'Set to true to show a fun Extra Life themed confetti animation during alerts.',
        ],
        [
            'isRaisedLinePlural',
            process.env.VITE_IS_RAISED_LINE_PLURAL,
            false,
            'Some participants like to refer to their entire community and/or network of supporters. ' +
            'If set to true, "Our" and "We\'ve" will be used instead of "My" and "I\'ve" in the lines ' +
            'that describe the amount raised while in particpant mode. Note that the plural forms are ' +
            'always used in team mode.',
        ],
        [
            'progressFormat',
            process.env.VITE_PROGRESS_FORMAT,
            true,
            'Determines how progress is shown on the main view. Set to "raisedOnly" to only show ' +
            'the amount raised. Set to "raisedAndGoal" to also show the goal. Set to "progressBar" to show ' +
            'a progress bar in addition to the raised and goal amounts.',
        ],
        [
            'areMilestoneMarkersVisible',
            process.env.VITE_ARE_MILESTONE_MARKERS_VISIBLE,
            false,
            'Set to true to show milestone markers on the progress bar. Only applies if progressFormat ' +
            'is set to "progressBar".',
        ],
        [
            'areCentsVisible',
            process.env.VITE_ARE_CENTS_VISIBLE,
            false,
            'For raised and goal amounts that have cents, setting this to true will display those ' +
            'cents and not just the nearest dollar. Note that cents are always shown in donation and ' +
            'milestone alerts if the amounts have them.',
        ],
        [
            'moneyFormat',
            process.env.VITE_MONEY_FORMAT,
            true,
            'Determines how amounts are formatted. Setting to "fancy" will show the dollar sign and ' +
            'cents smaller and raised while "standard" will show all characters at the same size.',
        ],
        [
            'isYearModeEnabled',
            process.env.VITE_IS_YEAR_MODE_ENABLED,
            false,
            'An alternate display aimed to support participants and teams that fundraise all year ' +
            'long. The count down/up timer is hidden and replaced with the current year.',
        ],
        [
            'voice',
            process.env.VITE_VOICE,
            true,
            'Set to "US English Male", "US English Female", "UK English Male", "UK English Female", ' +
            '"French Canadian Male", "French Canadian Female", "Spanish Latin American Male", ' +
            '"Spanish Latin American Female" or set to "" to not read messages with text-to-speech.',
        ],
        [
            'volume',
            process.env.VITE_VOLUME,
            false,
            'The volume for all sound effects and text-to-speech. 100 is full volume and 0 is muted.',
        ],
        [
            'lang',
            process.env.VITE_LANG,
            true,
            'Language to use for all text displayed in the Helper. Supported options are "en" for ' +
            'English (United States), "fr" for French (Canada), or "es" for Spanish (Latin America)',
        ],
        [
            'areMetricsEnabled',
            process.env.VITE_ARE_METRICS_ENABLED,
            false,
            'If enabled, some general information will be tracked in order to help bread4kids ' +
            'understand how participants and teams are using the Helper. This is to support future ' +
            'feature development and testing. Metrics sent includes Helper settings used, publicly ' +
            'available participant and team information, browser name and version, device make and ' +
            'model, and operating system name and version. No private information is collected or ' +
            'shared and metrics are only accessible by bread4kids',
        ],
    ];

    const colWidth1 = 36;
    const colWidth2 = 46;

    let content = '\n';
    content += '    <script type="text/javascript">\n';
    content += '        // For use details and instructions, visit https://github.com/breadweb/extralife-helper\n';
    content += '        // For support or feature requests, visit https://bread4kids.tv/discord\n';
    content += '        // ====================================================================================\n';

    items.forEach(item => {
        let firstLineStart = `${item[0]} = ${item[2] ? `"${item[1]}"` : item[1]};`;
        firstLineStart += ' '.repeat(colWidth1 - firstLineStart.length);
        const emptyLineStart = ' '.repeat(colWidth1);

        const words = item[3].split(' ');

        const lines = [];
        let line = '';
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (line.length + word.length + 1 > colWidth2) {
                lines.push(`// ${line}`);
                line = `${word} `;
            } else {
                line += `${word} `;
            }
        }
        if (line !== '') {
            lines.push(`// ${line}`);
        }

        lines.forEach((line, index) => {
            if (index === 0) {
                content += `\n        ${firstLineStart}${line}\n`;
            } else {
                content += `        ${emptyLineStart}${line}\n`;
            }
        });
    });

    content += '        // ====================================================================================\n';
    content += '    </script>\n';

    return content;
};
