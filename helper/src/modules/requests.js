export const parseRequestError = (err) => {
    const result = {
        status: 0,
        message: '',
    };
    if (err.response) {
        // Request was made and the server responded with a status code other than 200.
        result.status = err.response.status;
        // Additional information for failed requests may be in the response body.
        if (err.response.data) {
            result.message = err.response.data;
        }
    } else if (err.request) {
        // The request was made but no response was received. This error is returned by axios.
        result.message = err.request;
    } else if (err.message) {
        // An application error happened when setting up the request.
        result.message = err.message;
    } else {
        // Some other application code error happened.
        result.message = err;
    }
    return result;
};
