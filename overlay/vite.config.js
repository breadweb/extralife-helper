import { defineConfig } from 'vite';
import { viteSingleFile } from "vite-plugin-singlefile"
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
    console.log('Adding Helper settings section...');
    return {
        name: 'add-helper-settings',
        enforce: "post",
        generateBundle: (_, bundle) => {
            const htmlChunk = bundle['index.html'];
            htmlChunk.source = htmlChunk.source.replace(
                '</title>',
                `</title>\n${getSettingsContent()}`,
            );
        }
    };
}

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
            'Set to the date your Extra Life event starts. The local timezone of your computer will be used.',
        ],
        [
            'startTime',
            process.env.VITE_START_TIME,
            true,
            'Set to the time your Extra Life event starts using a 24 hour clock. The local timezone of ' +
            'your computer will be used.',
        ],
        [
            'theme',
            process.env.VITE_THEME,
            true,
            'Theme choices: white1, gray1, blue1, or blue2.',
        ],
        [
            'border',
            process.env.VITE_BORDER,
            true,
            'Border type choices: rounded, square, or none.',
        ],
        [
            'areAlertsEnabled',
            process.env.VITE_ARE_ALERTS_ENABLED,
            false,
            'Set to false to suppress donation alerts.',
        ],
        [
            'isRaisedLinePlural',
            process.env.VITE_IS_RAISED_LINE_PLURAL,
            false,
            'Some participants like to refer to their entire community and/or network of supporters. ' +
            'If set to true, "Our" will be used instead of "My" in the line that describes the amount ' +
            'raised while in particpant mode. Note that "Our" is always used in team mode.',
        ],
        [
            'isGoalVisible',
            process.env.VITE_IS_GOAL_VISIBLE,
            false,
            'Set to false to only show amount raised on the main screen and not also your goal.',
        ],
        [
            'areCentsVisible',
            process.env.VITE_ARE_CENTS_VISIBLE,
            false,
            'Set to true to show cents in the raised and/or goal amounts shown. Note that cents ' +
            'are always shown in donation amounts.',
        ],
        [
            'isYearModeEnabled',
            process.env.VITE_IS_YEAR_MODE_ENABLED,
            false,
            'An alternate display to support fundraising all year. The count down/up timer is hidden.',
        ],
        [
            'voice',
            process.env.VITE_VOICE,
            true,
            'Set to US-male, US-female, UK-male, UK-female, FR-male, FR-female, ES-male, ES-female ' +
            'or set to "" to not read messages with text-to-speech.',
        ],
        [
            'volume',
            process.env.VITE_VOLUME,
            false,
            'The volume for all sound effects and text-to-speech.',
        ],
        [
            'lang',
            process.env.VITE_LANG,
            true,
            'Language to use for all text displayed in the Helper. Supported options are en-us for ' +
            'English (United States), fr-ca for French (Canada), or es-419 for Spanish (Latin America)',
        ]
    ]

    const colWidth1 = 48;
    const colWidth2 = 66;

    let content = '\n';
    content += '    <script type="text/javascript">\n';
    content += '        // For use details and instructions, visit https://github.com/breadweb/extralife-helper\n';
    content += '        // For support or feature requests, visit https://discord.gg/aArewEc\n';
    content += '        // ====================================================================================\n';

    items.forEach(item => {
        let output = `        ${item[0]} = ${item[2] ? `"${item[1]}"` : item[1]};`;
        output += ' '.repeat(colWidth1 - output.length);
        const words = item[3].split(' ');
        let lineNumber = 0;
        let portion = '';
        let shouldWrite = false;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (portion.length + word.length + 1 <= colWidth2) {
                portion += `${word} `;
                if (i === words.length - 1) {
                    lineNumber++;
                    shouldWrite = true;
                }
            } else {
                lineNumber++;
                shouldWrite = true;
            }
            if (shouldWrite) {
                if (lineNumber > 1) {
                    output += ' '.repeat(colWidth1);
                }
                output += `// ${portion}\n`;
                portion = `${word} `;
                shouldWrite = false;
            }
        };
        content += output;
    });

    content += '        // ====================================================================================\n';
    content += '    </script>\n';

    return content;
};
