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

function helperSettings() {
    return {
        name: 'add-helper-settings',
        enforce: "post",
        generateBundle: (_, bundle) => {
            const htmlChunk = bundle['index.html'];
            let newHtml = htmlChunk.source;
            newHtml = newHtml.replace('</title>', `</title>\n${settingsContent}`);
            htmlChunk.source = newHtml;
        }
    };
}

const settingsContent = `
    <script type="text/javascript">

        // Extra Life Helper - Settings

        // For use details and use instructions, visit https://github.com/breadweb/extralife-helper
        // For support or feature requests, visit https://discord.gg/aArewEc

        // ============================================================================================

        participantId = "${process.env.VITE_PARTICIPANT_ID}";              // Set this to "" to run in team mode.

        teamId = "${process.env.VITE_TEAM_ID}";                      // Set this to "" to run in participant mode.

        startDate = "${process.env.VITE_START_DATE}";              // Set to the date your Extra Life event starts. The
                                               // local timezone of your computer will be used.

        startTime = "${process.env.VITE_START_TIME}";                // Set to the time your Extra Life event starts. The
                                               // local timezone of your computer will be used.

        helperTheme = "${process.env.VITE_THEME}";                 // Theme choices: white1, gray1, blue1, or blue2.

        helperBorder = "${process.env.VITE_BORDER}";              // Border type choices: rounded, square, or none.

        helperWidth = ${process.env.VITE_WIDTH};                     // Width of the Helper, in pixels.

        showDonationAlerts = ${process.env.VITE_SHOW_ALERTS};             // Set to false to suppress donation alerts.

        showGoal = ${process.env.VITE_SHOW_GOAL};                       // Set to false to hide your goal and only show the
                                               // current amount raised.

        showYearMode = ${process.env.VITE_SHOW_YEAR_MODE};                  // An alternate display to support fundraising all
                                               // year. The count down/up timer is hidden.

        donationMessageVoice = "${process.env.VITE_MESSAGE_VOICE}";    // Set to US-male, US-female, UK-male, UK-female,
                                               // FR-male, FR-female, ES-male, ES-female or set
                                               // to "" to not read messages with text-to-speech.

        volume = ${process.env.VITE_VOLUME};                          // The volume for all sound effects and text-to-speech.

        lang = "${process.env.VITE_LANG}";                        // Language to use for all text displayed in the
                                               // Helper. Supported options are en-us for
                                               // English (United States), fr-ca for French (Canada),
                                               // or es-419 for Spanish (Latin America)

        // ============================================================================================

    </script>\n`;
