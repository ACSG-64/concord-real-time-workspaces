
const { param } = require('express-validator');
const { isUUID } = require('../../../utils/custom-validators');
const jwt = require('jsonwebtoken');
const { Workspace } = require('../../../models/index');
const checkWorkspaceOwnership = require('../../../utils/check-workspace-ownership');
const { v4: UUIDv4 } = require('uuid');

async function controller(req, res) {
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

    /* Create a new invitation ID */
    // If the new ID creates conflict with other ID, try creating a new one (3 attempts max)
    for (let attempt = 3; attempt > 0; --attempt) {
        try {
            const newInvitationId = UUIDv4(); // generate the new ID
            await Workspace.update(
                { invitationId: newInvitationId }, // update the invitationId
                { where: { id: workspaceId } }
            );
            // Respond with the new invitation ID 
            return res.status(200).json({
                invitationId: newInvitationId
            });
        } catch (e) {
            if (e?.name === 'SequelizeUniqueConstraintError') continue;
            else return res.status(500).send('Unexpected error, please try again');
        }
    }

    res.status(500).send('It was not possible to create a new invitation id, please try again');
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