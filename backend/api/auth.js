const express = require('express');
const { register, login } = require('../controllers/auth/index');

const router = express.Router();

router.post('/register', register.validators, register.controller);
router.post('/login', login.validators, login.controller);

module.exports = router;
