/**
 * Standardized API Response class for consistent response formatting
 * Used to structure successful API responses across the application
 */

class ApiResponse {
    /**
     * Creates a new API Response instance
     * @param {number} statusCode - HTTP status code
     * @param {*} data - Response data payload
     * @param {string} message - Success message
     */
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // Success if status code is less than 400
    }
}

export {ApiResponse}