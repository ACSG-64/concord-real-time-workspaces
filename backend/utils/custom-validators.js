const { validate: validateUUID } = require('uuid');

function isUUID(uuid) {
    if (!validateUUID(uuid)) throw new Error('Invalid UUID');
    return true;
}

module.exports = {
    isUUID,
};