/**
 * Custom API Error class for handling application errors
 * Extends the built-in Error class with additional properties for API responses
 */

class ApiError extends Error {
    /**
     * Creates a new API Error instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Array of detailed error information
     * @param {string} stack - Error stack trace
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false; // Always false for errors
        this.errors = errors

        // Set custom stack trace or capture current one
        if(stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}