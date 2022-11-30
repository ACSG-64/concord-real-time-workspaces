const express = require('express');
const rateLimit = require('express-rate-limit');
const args = require('../utils/args');
const toMilliseconds = require('../utils/to-milliseconds');
const { clientAuthorization } = require('../controllers/middleware/index');
const { validationErrorHandler } = require('../controllers/middleware/index');
const {create, remove} = require('../controllers/workspace/index');

const router = express.Router();

/* Limiters */
router.use(rateLimit({
    windowMs: toMilliseconds({ minutes: 10 }),
    max: args.mode === 'production' ? 5 : 100,
    message: 'Too many requests, try again later',
    standardHeaders: true,
}));
// Protect the route from unauthorized users
router.use(clientAuthorization);

/* Routes */
router.post(
    '/create',
    create.validators, validationErrorHandler,
    create.controller
);
router.delete(
    '/delete/:workspaceId',
    remove.validators, validationErrorHandler,
    remove.controller
);

module.exports = router;