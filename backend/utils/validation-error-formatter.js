/**
 * Extracts the 'msg' and 'param' fields from the errors 
 * captured by the 'validationResult' function of 'express-validator'
 * @param {Result<ValidationError>} errors - value returned from the function 'validationResult'
 * @returns {Result<ValidationError>} same input object but each error element containing only the 'msg' and 'param' fields 
 */
module.exports = function (errors) {
    return errors.array().map(({ msg, param }) => {
        return { msg, param };
    });
};
