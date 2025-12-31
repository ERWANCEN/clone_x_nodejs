const createError = (status, message, details = null) => {
    // creates a new empty error instance
    const error = new Error();
    /* 
        Sets the error status code based on the “status” parameter
    */
    error.status = status;
    /* 
        Sets the error status code based on the “message” parameter
    */
    error.message = message;
    /* 
        Allows you to add additional information if necessary
    */
    error.details = details;

    return error;
}

module.exports = createError;