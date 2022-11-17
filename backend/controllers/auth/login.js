const args = require('../../utils/args');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { User } = require('../../models/index');
const toMilliseconds = require('../../utils/toMilliseconds');

const COOKIE_NAME = 'concord_auth';
async function controller(req, res) {
    // Get the needed fields from the body of the request
    const { user_id, password: raw_pswd } = req.body;

    /* Query the DB */
    let record;
    try {
        // Search for the user in the DB. 
        record = await User.findOne({
            attributes: ['id', 'password'], // we only need the id and the password
            where: {
                // search by user_name OR email
                [Op.or]: [
                    { user_name: user_id },
                    { email: user_id }
                ]
            }
        });
    } catch (e) {
        return res.status(500).send('An error has ocurred, please try again');
    }

    /* Data verification */
    // If there is not record, that is, the user doesn't exist, return
    if (!record) return res.status(404).send('Invalid credentials');

    // If the provided password doesn't match with the hashed password in the DB, return
    if (await !argon2.verify(record.password, `${raw_pswd}`)) return res.status(404).end();


    /* Cookie setup */
    // Set the expiration time in milliseconds for the cookie and the JWT
    const expMillis = toMilliseconds({ hours: 3 });

    // Create a signed JWT
    const session_jwt = await jwt.sign(
        { uuid: record.id }, // payload, we are using only the ID of the user
        process.env.JWT_SECRET, // signature
        { expiresIn: `${expMillis}` }
    );

    // Cookie settings
    const cookieSettings = {
        httpOnly: true,
        sameSite: false,
        maxAge: expMillis,
    };
    if (args.mode === 'production') {
        cookieSettings.secure = true;
        cookieSettings.sameSite = true;
    }

    // Send the cookie to the client
    res.status(200).cookie(
        COOKIE_NAME, // cookie name
        session_jwt, // value, in this case, the JWT
        cookieSettings, // settings
    ).end();
}

const validators = [
    body('user_id')
        .trim().isLength({ min: 3, max: 50 })
        .withMessage('Must be between 3 and 50 characters long'),
    body('password')
        .isLength({ max: 50 })
        .withMessage('Must be maximum 50 characters long'),
];

module.exports = {
    controller,
    validators,
};