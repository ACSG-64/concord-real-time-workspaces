const express = require('express');
const { clientAuthorization } = require('../../controllers/middleware/index');
const { validationErrorHandler } = require('../../controllers/middleware/index');
const { joinWorkspace } = require('../../controllers/workspace/index').general;

const router = express.Router();

router.use(clientAuthorization);

/* Routes */
router.get(
    '/invitation/:invitationId',
    joinWorkspace.validators, validationErrorHandler,
    joinWorkspace.controller
);

module.exports = router;