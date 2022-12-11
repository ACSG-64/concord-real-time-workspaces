const { param } = require('express-validator');
const { isUUID } = require('../../../utils/custom-validators');
const jwt = require('jsonwebtoken');
const { Workspace, Membership } = require('../../../models/index');

async function controller(req, res) {
    // Grab the invitationId from the params
    const { invitationId } = req.params;
    // Extract the User uuid from the cookie
    const { uuid: userId } = jwt.decode(req.cookies['concord_auth']);

    /* Verify if the workspace is accepting newcomers */
    let workspaceId, acceptingNewcomers;
    try {
        ({ id: workspaceId, acceptingNewcomers } = await Workspace.findOne({
            where: { invitationId },
            attributes: ['id', 'acceptingNewcomers'],
        }));

        /* Handle if the workspace is not accepting newcomers */
        if (acceptingNewcomers == null) {
            return res.status(410).send('The invitation has expired');
        } else if (acceptingNewcomers == false) {
            return res.status(403).send('This workspace is not accepting new members');
        }
    } catch (e) {
        return res.status(500).send('Unexpected error, please try again');
    }

    /* Create a new membership */
    try {
        await Membership.create({ userId, workspaceId });
    } catch (e) {
        // If the user has has already a membership, do nothing
        if (e?.name !== 'SequelizeUniqueConstraintError') {
            return res.status(500).send('Unexpected error, please try again');
        }
    }

    res.status(200).send('You have been granted access to this workspace');
}

const validators = [
    param('invitationId')
        .isLength({ min: 36, max: 36 })
        .withMessage('Invalid invitation ID')
        .custom(isUUID)        
        .withMessage('Invalid invitation ID'),
];

module.exports = {
    controller,
    validators
};