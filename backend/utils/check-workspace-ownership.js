const { Membership } = require('../models/index');

/**
 * Verifies if the user is the owner of the selected workspace
 * @param {string} userId the user UUID
 * @param {string} workspaceId the workspace UUID
 * @returns {Promise<boolean>} true if the user is the owner, false if is not
 * @throws Sequelize error
 */
module.exports = async function (userId, workspaceId) {
    // Grab the role of the user
    const { role } = await Membership.findOne({
        where: { userId, workspaceId },
        attributes: ['role'],
    });
    return role === 'owner';
};