const express = require('express');
const rateLimit = require('express-rate-limit');
const args = require('../utils/args');
const toMilliseconds = require('../utils/to-milliseconds');
const { clientAuthorization } = require('../controllers/middleware/index');
const { validationErrorHandler } = require('../controllers/middleware/index');
const { updateInfo, updatePassword } = require('../controllers/account/index');

const router = express.Router();

/* Middleware */
// Limiter
router.use(rateLimit({
    windowMs: args.mode === 'production'
        ? toMilliseconds({ minutes: 5 })
        : toMilliseconds({ minutes: 10 }), 
    max: args.mode === 'production' ? 5 : 100, 
    message: 'Too many requests, try again later',
    standardHeaders: true,
}));
// Protect the route from unauthorized users
router.use(clientAuthorization);

/* Routes */
router.put(
    '/update',
    updateInfo.validators, validationErrorHandler,
    updateInfo.controller
);

router.put(
    '/update/password',
    updatePassword.validators, validationErrorHandler,
    updatePassword.controller
);

module.exports = router;
