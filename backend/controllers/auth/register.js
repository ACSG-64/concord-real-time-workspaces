const { body, validationResult } = require('express-validator');
const argon2 = require('argon2');
const { User } = require('../../models/index');
const { removeExtraSpaces } = require('../../utils/custom-sanitizers');

async function controller(req, res) {
    // Check if the data is valid (from the middleware)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            // Only send the error msg and the param where the error was found to avoid expose more info
            errors: errors.array().map(({ msg, param }) => { return { msg, param }; })
        });
    }

    // Get the needed fields from the body of the request
    const { first_name, last_name, user_name, email, password: raw_pswd } = req.body;

    try {
        // Securely hash the password using the Argon2id algorithm
        const password = await argon2.hash(raw_pswd);
        // Store the new user into the DB
        await User.create({
            first_name, last_name, user_name,
            email, password,
        });
        // Respond to the client on success
        res.status(200).send('User registered successfully');
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            res.status(409).send('An account with that user name or email already exists');
        } else {
            res.status(500).send('Unexpected error, please try again');
        }
    }
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
        .withMessage('Must be maximum 50 characters long')
        .isStrongPassword()
        .withMessage('Must contain 8 or more characters long and must contain'
            + 'at least one lowercase letter, '
            + 'at least one uppercase letter, '
            + 'at least 1 number '
            + 'and at least 1 symbol'),
];

module.exports = {
    validators,
    controller
};
