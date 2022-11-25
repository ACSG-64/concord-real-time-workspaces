const jwt = require('jsonwebtoken');

/**
 * Authorization middleware. Verifies the validity of the JWT provided by the client through the auth cookie, 
 * if it is invalid, prevents to go to the next handler. 
 * @param {Express.req} req 
 * @param {Express.res} res 
 * @param {Express.next} next 
 */
module.exports = async function (req, res, next) {
    try {
        // Verify the JWT from the cookie
        await jwt.verify(req.cookies['concord_auth'], process.env.JWT_SECRET);
        next(); // if the JWT is valid, proceed to the next handler
    } catch (e) {
        // If the JWT is invalid, respond immediately
        res.status(401).send('You need to authenticate first');
    }
};