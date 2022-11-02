const express = require('express');
const { register } = require('../controllers/auth/index');

const router = express.Router();

router.post('/register', register.validators, register.controller);

module.exports = router;
