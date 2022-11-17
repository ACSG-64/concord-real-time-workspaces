const { validationResult } = require('express-validator');
const validationErrorFormatter = require('../../utils/validation-error-formatter');

/**
 * Checks if the incoming data is valid (from the 'express-validator' middleware).
 * This middleware must not be placed before any 'express-validator' middleware.
 * @param {Express.req} req 
 * @param {Express.res} res 
 * @param {Express.next} next 
 */
module.exports = function (req, res, next) {
    // Check if the data is valid (from the middleware)
    const errors = validationResult(req);
    if (errors.isEmpty()) next(); // if there is not errors, proceed to the next controller or middleware
    else res.status(400).json({ errors: validationErrorFormatter(errors) }); // otherwise, respond immediately    
};
