const { param } = require('express-validator');
const { isUUID } = require('../../../utils/custom-validators');
const jwt = require('jsonwebtoken');
const checkWorkspaceOwnership = require('../../../utils/check-workspace-ownership');
const { Workspace } = require('../../../models/index');

/**
 * Set the field 'acceptingNewcomers' of the Workspace model to true or false
 * @param {Express.req} req 
 * @param {Express.res} res 
 * @param {Express.next} next 
 * @param {Boolean} enableInvitationLink true to enable, false to disable. By default is true
 */
async function controller(req, res, next, enableInvitationLink = true) {
    //Grab the workspace Id from the request params
    const { workspaceId } = req.params;
    // Extract the User uuid from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    /* Verify if the user is the owner of the workspace */
    try {
        // If the user is not the owner of that workspace, return
        if (!(await checkWorkspaceOwnership(uuid, workspaceId))) {
            return res.status(401).send('You don\'t have permissions to perform that action');
        }
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    /* Update the 'acceptingNewcomers' field */
    try {
        await Workspace.update(
            { acceptingNewcomers: enableInvitationLink },
            { where: { id: workspaceId } }
        );
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    res.status(200).send('Changed invitation link visibility successfully');
}

const validators = [
    param('workspaceId')
        .isLength({ min: 36, max: 36 })
        .withMessage('Invalid workspace ID')
        .custom(isUUID)
        .withMessage('Invalid workspace ID'),
];

module.exports = {
    controller,
    validators,
};