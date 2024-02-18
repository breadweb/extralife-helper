const { createThemes } = require('tw-colors');

module.exports = {
    content: [
        './src/**/*.{html,js,jsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'cantarell': ['Cantarell'],
                'digital': ['DigitalBread'],
                'furore': ['Furore']
            },
        },
    },
    plugins: [
        createThemes({
            'blue1': {
                'helper1': '#97C93D', // Green
                'helper2': '#1D4C6C', // Dark Blue
                'helper3': '#FFFFFF', // White
                'helper4': '#97C93D', // Green
            },
            'blue2': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#28C0E8', // Light Blue
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#FFFFFF', // White
            },
            'gray1': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#BCBEC0', // Gray
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#FFFFFF', // White
            },
            'white1': {
                'helper1': '#1D4C6C', // Dark Blue
                'helper2': '#FFFFFF', // White
                'helper3': '#1D4C6C', // Dark Blue
                'helper4': '#28C0E8', // Light Blue
            },
        }),
    ],
};
