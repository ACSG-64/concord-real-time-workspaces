const args = require('../utils/args');
const express = require('express');
const rateLimit = require('express-rate-limit');
const toMilliseconds = require('../utils/toMilliseconds');
const { register, login } = require('../controllers/auth/index');

const router = express.Router();

/* Limiters */
const registerLimiter = rateLimit({
	windowMs: toMilliseconds({ minutes: 5 }),
	max: args.mode === 'production' ? 2 : 100,
	message: 'Too many requests, try again later',
	standardHeaders: true,
});

const loginLimiter = rateLimit({
	windowMs: toMilliseconds({ minutes: 5 }),
	max: args.mode === 'production' ? 5 : 100,
	message: 'Too many attempts, try again later',
	standardHeaders: true,
});

/* Routes */
router.post(
	'/register', registerLimiter,
	register.validators, register.controller
);
router.post(
	'/login', loginLimiter,
	login.validators, login.controller
);

module.exports = router;
