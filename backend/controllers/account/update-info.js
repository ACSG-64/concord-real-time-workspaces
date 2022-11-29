const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { User } = require('../../models/index');
const { removeExtraSpaces } = require('../../utils/custom-sanitizers');

async function controller(req, res) {
    // Get the needed fields from the body
    const { first_name, last_name, user_name, email, password: raw_pswd } = req.body;

    // Extract the UUID from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    try {
        // Get the password of the user
        const { password } = await User.findByPk(uuid, { attributes: ['password'] });
        // If the raw password does not match with the password in the DB, return.
        if (!(await argon2.verify(password, raw_pswd)))
            return res.status(403).send('Incorrect password');
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }

    try {
        // Update user information
        await User.update(
            { first_name, last_name, user_name, email },
            { where: { id: uuid } }
        );
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send('An account with that user name or email already exists');
        } else {
            return res.status(500).send('Unexpected error, please try again');
        }
    }

    res.status(200).send('Successfully changed information');
}

const validators = [
    body('first_name')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Only alphanumerical characters are allowed')
        .customSanitizer(removeExtraSpaces)
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Must be between 3 to 50 characters long'),
    body('last_name')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Only alphanumerical characters are allowed')
        .customSanitizer(removeExtraSpaces)
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Must be between 3 to 50 characters long'),
    body('user_name')
        .trim().isAlphanumeric()
        .isLength({ min: 3, max: 10 })
        .withMessage('Must be between 3 to 10 characters long'),
    body('email')
        .trim().isEmail()
        .withMessage('Invalid email')
        .normalizeEmail(),
    body('password')
        .isLength({ max: 50 })
        .withMessage('Must be maximum 50 characters long'),
];

module.exports = {
    validators,
    controller,
};
