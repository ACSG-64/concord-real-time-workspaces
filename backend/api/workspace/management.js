const express = require('express');
const rateLimit = require('express-rate-limit');
const args = require('../../utils/args');
const toMilliseconds = require('../../utils/to-milliseconds');
const { clientAuthorization } = require('../../controllers/middleware/index');
const { validationErrorHandler } = require('../../controllers/middleware/index');
const {
    createWorkspace, removeWorkspace,
    generateInvitation, toggleInvitation
} = require('../../controllers/workspace/index').management;

const router = express.Router();

/* Limiters */
router.use(rateLimit({
    windowMs: toMilliseconds({ minutes: 10 }),
    max: args.mode === 'production' ? 5 : 100,
    message: 'Too many requests, try again later',
    standardHeaders: true,
}));

/* Auth middleware */
// Protect the route from unauthorized users
router.use(clientAuthorization);

/* Routes */
router.post(
    '/create',
    createWorkspace.validators, validationErrorHandler,
    createWorkspace.controller
);

router.delete(
    '/delete/:workspaceId',
    removeWorkspace.validators, validationErrorHandler,
    removeWorkspace.controller
);

// Invitations
router.get(
    '/:workspaceId/invitation/generate',
    generateInvitation.validators, validationErrorHandler,
    generateInvitation.controller
);

router.patch(
    '/:workspaceId/invitation/enable',
    toggleInvitation.validators, validationErrorHandler,
    toggleInvitation.controller
);

router.patch(
    '/:workspaceId/invitation/disable',
    toggleInvitation.validators, validationErrorHandler,
    async (req, res, next) => await toggleInvitation.controller(req, res, next, false)
);

module.exports = router;