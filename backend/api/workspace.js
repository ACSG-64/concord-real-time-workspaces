const express = require('express');

const { management, general } = require('./workspace/index');
const router = express.Router();

router.use('/manage', management);
router.use('/', general);

module.exports = router;