const { body, param } = require('express-validator');
const { isUUID } = require('../../../utils/custom-validators');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const checkWorkspaceOwnership = require('../../../utils/check-workspace-ownership');
const { User, Workspace } = require('../../../models/index');

async function controller(req, res) {
    // Get the needed fields from the body
    const { password: raw_pswd } = req.body;
    //Grab the workspace Id from the request params
    const { workspaceId } = req.params;
    // Extract the User uuid from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    try {
        // Get the password of the user
        const { password } = await User.findByPk(uuid, { attributes: ['password'] });
        // Verify if the password entered is the correct one in the DB
        if (!(await argon2.verify(password, raw_pswd))) {
            return res.status(403).send('Incorrect password');
        }
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    try {
        // If the user is not the owner of that workspace, return
        if (!(await checkWorkspaceOwnership(uuid, workspaceId))) {
            return res.status(401).send('You don\'t have permissions to perform that action');
        }
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    try {
        await Workspace.destroy({ where: { id: workspaceId } });
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    res.status(200).send('Workspace successfully deleted');
}

const validators = [
    body('password')
        .isLength({ max: 50 })
        .withMessage('Must be maximum 50 characters long'),
    param('workspaceId')
        .isLength({ min: 36, max: 36 })
        .withMessage('Invalid workspace ID')
        .custom(isUUID)
        .withMessage('Invalid workspace ID'),
];

module.exports = {
    validators,
    controller,
};
