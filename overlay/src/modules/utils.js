/**
 * Makes it possible to serialize an error that might be a custom object or an Error object.
 * Using JSON.stringify without the second parameter on an Error object will return a blank
 * string.
 */
export function serializeError (err) {
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
}

// Helps evaluate a boolean input parameter that may be a boolean or a string.
export function isParamValueTrue (value) {
    return value?.toString().toLowerCase() === 'true';
}
