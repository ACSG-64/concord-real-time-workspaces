const clientAuthorization = require('./client-authorization');
const weakClientAuthorization = require('./weak-client-authorization');
const validationErrorHandler = require('./validation-error-handler');

module.exports = {
    clientAuthorization,
    weakClientAuthorization,
    validationErrorHandler,
};