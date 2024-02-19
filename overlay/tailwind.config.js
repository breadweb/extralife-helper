const { createThemes } = require('tw-colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
    content: ['./src/**/*.{html,js,jsx}'],
    theme: {
        extend: {
            animation: {
                'pop-in': 'pop-in .6s both',
                'fade-in': 'fade-in .8s both',
            },
            fontFamily: {
                cantarell: ['Cantarell'],
                digital: ['DigitalBread'],
                furore: ['Furore'],
            },
            keyframes: {
                'fade-in': {
                    '0%': {
                        opacity: 0,
                    },
                    '100%': {
                        opacity: 1,
                    },
                },
                'pop-in': {
                    '0%': {
                        opacity: 0,
                        transform: 'scale(0.1)',
                    },
                    '50%': {
                        transform: 'scale(1.2)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'scale(1)',
                    },
                },
            },
        },
    },
    plugins: [
        plugin(({ matchUtilities, theme }) => {
            matchUtilities(
                {
                    'animate-delay': value => ({
                        animationDelay: value,
                    }),
                },
                {
                    values: theme('transitionDelay'),
                },
            );
        }),
        createThemes({
            'blue1': {
                'helper1': '#97C93D', // Green
                'helper2': '#1D4C6C', // Dark Blue
                'helper3': '#FFFFFF', // White
                'helper4': '#97C93D', // Green
                'helper5': '#1D4C6C', // Dark Blue
            },
            'blue2': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#28C0E8', // Light Blue
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#FFFFFF', // White
                'helper5': '#28C0E8', // Light Blue
            },
            'gray1': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#BCBEC0', // Gray
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#FFFFFF', // White
                'helper5': '#BCBEC0', // Gray
            },
            'white1': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#FFFFFF', // White
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#28C0E8', // Light Blue
                'helper5': '#FFFFFF', // White
            },
            'custom': {
                'helper1': '',
                'helper2': '',
                'helper3': '',
                'helper4': '',
                'helper5': '',
            },
        }),
    ],
};
