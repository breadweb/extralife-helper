import './Main.css'
import './modules/i18n';
import App from './App.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'

console.log(
    ' _                        _              _                 _   \n' +
    '| |__  _ __ ___  __ _  __| |_      _____| |__   _ __   ___| |_ \n' +
    '| \'_ \\| \'__/ _ \\/ _` |/ _` \\ \\ /\\ / / _ \\ \'_ \\ | \'_ \\ / _ \\ __|\n' +
    '| |_) | | |  __/ (_| | (_| |\\ V  V /  __/ |_) || | | |  __/ |_ \n' +
    '|_.__/|_|  \\___|\\__,_|\\__,_| \\_/\\_/ \\___|_.__(_)_| |_|\\___|\\__|',
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
