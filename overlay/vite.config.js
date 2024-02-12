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

        // Extra Life Helper

        // For use details and use instructions, visit https://github.com/breadweb/extralife-helper
        // For support or feature requests, visit https://discord.gg/aArewEc

        // ============================================================================================

        participantId = "531439";              // Set this to "" to run in team mode.

        teamId = "";                           // Set this to "" to run in participant mode.

        startDate = "11-02-2024";              // Set to the date your Extra Life event starts. The
                                               // local timezone of your computer will be used.

        startTime = "13:00:00";                // Set to the time your Extra Life event starts. The
                                               // local timezone of your computer will be used.

        helperTheme = "blue1";                 // Theme choices: white1, gray1, blue1, or blue2.

        helperBorder = "rounded";              // Border type choices: rounded, square, or none.

        helperWidth = 540;                     // Width of the Helper, in pixels.

        showDonationAlerts = true;             // Set to false to suppress donation alerts.

        showGoal = true;                       // Set to false to hide your goal and only show the
                                               // current amount raised.

        showYearMode = false;                  // An alternate display to support fundraising all
                                               // year. The count down/up timer is hidden.

        donationSounds = "cash.mp3,kids.mp3";  // Set this to your custom set of sounds, separated
                                               // by commas. Or set to "" to play no sounds.

        donationMessageVoice = "US-female";    // Set to US-male, US-female, UK-male, UK-female,
                                               // FR-male, FR-female, ES-male, ES-female or set
                                               // to "" to not read messages with text-to-speech.

        testDonationSeconds = 0;               // Number of seconds to show a test donation after
                                               // the Helper loads. Set to 0 to disable.

        volume = 100;                          // The volume for all sound effects and text-to-speech.

        lang = "en-us";                        // Language to use for all text displayed in the
                                               // Helper. Supported options are en-us for
                                               // English (United States), fr-ca for French (Canada),
                                               // or es-419 for Spanish (Latin America)

        // ============================================================================================

        // If you would like additional things to happen when a new donation is received, put them
        // in this function.
        function onNewDonation(donorName, donationAmount, message, avatarImageURL, createdOn, recipientName)
        {
            // Your custom logic here.
        }

    </script>\n`;
