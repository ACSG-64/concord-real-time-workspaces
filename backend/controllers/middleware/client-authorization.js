const jwt = require('jsonwebtoken');
const { User } = require('../../models/index');

/**
 * Authorization middleware. Verifies if the auth JWT is valid and if the user exists
 * @param {Express.req} req 
 * @param {Express.res} res 
 * @param {Express.next} next 
 */
module.exports = async function (req, res, next) {
    // Get the auth cookie
    const cookie = req.cookies['concord_auth'];

    // Verify if the cookie is present
    if (!cookie) {
        return res
            .status(401)
            .clearCookie('concord_auth')
            .send('You need to authenticate first');
    }

    // Get the UUID of the user from the JWT
    let uuid;
    try {
        // Verify the JWT from the cookie
        ({ uuid } = await jwt.verify(cookie, process.env.JWT_SECRET));
        if (!uuid) {
            return res
                .status(400)
                .clearCookie('concord_auth')
                .send('Malformed JWT, please authenticate again');
        }
    } catch (e) {
        return res
            .status(401)
            .clearCookie('concord_auth')
            .send(
                e?.message === 'TokenExpiredError'
                    ? 'Session expired'
                    : 'Invalid session'
            );
    }

    // Verify if the user exists in the DB
    try {
        const record = await User.findByPk(uuid, { attributes: ['user_name'] });
        if (!record) {
            return res
                .status(410)
                .clearCookie('concord_auth')
                .send('This user is not longer valid');
        }
    } catch (e) {
        return res
            .status(500)
            .clearCookie('concord_auth')
            .send('An error has occurred');
    }

    next(); // if the JWT is valid, proceed to the next handler
};