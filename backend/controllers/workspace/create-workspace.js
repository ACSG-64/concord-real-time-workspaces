const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Membership, Workspace, Channel} = require('../../models/index');
const { removeExtraSpaces } = require('../../utils/custom-sanitizers');

async function controller(req,res){
    //get the needed fields from the body
    const { name } = req.body;

    // Extract the UUID from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    let workspace;
    try {
        //Create workspace
        workspace = await Workspace.create({
            name,
        });
        //Add the owner role to the user of the workspace
        await Membership.create({
            role: 'owner',
            userId: uuid,
            workspaceId: workspace.id
        });
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            res.status(409).send('A Workspace with that name already exists');
        } else {
            res.status(500).send('Unexpected error, please try again');
        }
    }
    try {
        //Create a channel named General
        await Channel.create({
            name: 'general',
            description: 'First channel created.',
            workspaceId: workspace.id,
        });
    } catch (e) {
        res.status(500).send('Unexpected error, please try again');
    }
    res.status(200).send('Sucessfully created Workspace');
}

const validators = [
    body('name')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Only alphanumerical characters are allowed')
        .customSanitizer(removeExtraSpaces)
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Must be between 3 to 50 characters long'),
];

module.exports = {
    validators,
    controller,
};
