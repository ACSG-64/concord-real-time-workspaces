const { User } = require('../../models/index');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { body } = require('express-validator');

async function controller(req, res) {
    // Get the needed fields from the body
    const { password: raw_pswd, new_password } = req.body;

    // Extract the uuid from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    try {
        // Get the password of the user
        const { password } = await User.findByPk(uuid, { attributes: ['password'] });
        // Verify if the old password is the correct password in the DB
        if (!(await argon2.verify(password, raw_pswd))) {
            return res.status(403).send('Incorrect password');
        }
        // Check if the new password entered matches the one already in the DB
        if (await argon2.verify(password, new_password)) {
            return res.status(409).send('Do not use the same password');
        }
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    try {
        // Hash the new password
        const password = await argon2.hash(new_password);
        //Update user password
        await User.update({ password }, { where: { id: uuid } });
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    res.status(200).send('The password was successfully changed');
}

const validators = [
    body('password')
        .isLength({ max: 50 })
        .withMessage('Must be maximum 50 characters long'),
    body('new_password')
        .isLength({ max: 50 })
        .withMessage('Must be maximum 50 characters long')
        .isStrongPassword()
        .withMessage('Must contain 8 or more characters long and must contain '
            + 'at least one lowercase letter, '
            + 'at least one uppercase letter, '
            + 'at least 1 number '
            + 'and at least 1 symbol'),
];

module.exports = {
    validators,
    controller,
};