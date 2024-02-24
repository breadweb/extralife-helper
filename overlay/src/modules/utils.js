/**
 * Makes it possible to serialize an error into JSON that might be an Error object or a custom
 * object. Using JSON.stringify without the second parameter on an Error object will return a blank
 * string.
 */
export function serializeError (err) {
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
}

/**
 * Helps evaluate a boolean input parameter that may be a boolean or a string.
 */
export function isParamValueTrue (value) {
    return value?.toString().toLowerCase() === 'true';
}

/**
 * Ensures money is properly formatted based on varying amount formats and user settings.
 */
export function getFormattedMoney (amount, areCentsVisible) {
    const amountAsDollars = amount / 100;
    const currencyFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: areCentsVisible ? 2 : 0,
        minimumFractionDigits: areCentsVisible && Math.floor(amountAsDollars) !== amountAsDollars ? 2 : 0,
    });
    return currencyFormat.format(amount);
}
