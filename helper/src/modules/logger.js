const isDebugLoggingEnabled = import.meta.env.VITE_IS_DEBUG_LOGGING_ENABLED === 'true';

const logger = {
    debug: message => {
        if (isDebugLoggingEnabled) {
            console.log(message);
        }
    },
    info: message => {
        console.info(message);
    },
    warning: message => {
        console.warn(message);
    },
    error: message => {
        console.error(message);
    },
};

export default logger;
