/**
 * Makes it possible to serialize an error into JSON that might be an Error object or a custom
 * object. Using JSON.stringify without the second parameter on an Error object will return a blank
 * string.
 */
export const serializeError = (err) => {
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
};

/**
 * Helps evaluate a boolean input parameter that may be a boolean or a string.
 */
export const isParamValueTrue = (value) => {
    return value?.toString().toLowerCase() === 'true';
};
