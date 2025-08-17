/**
 * Higher-order function to handle async operations in Express routes
 * Automatically catches and forwards errors to Express error handling middleware
 */

/**
 * Wraps async route handlers to catch errors automatically
 * @param {Function} requestHandler - Async function to handle the request
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try{

//     } catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }