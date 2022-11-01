const express = require('express');
const { createServer } = require('http');
const path = require('path');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const args = require('./utils/args');

/* Configure the server */
const app = express();
const server = createServer(app);

/* Set the public folder to serve static content */
app.use(express.static(path.join(__dirname, 'public')));

/* Configure global middlewares */
app.use(helmet()); // set HTTP security headers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/* Server events */
server.on('listening', () => {
	const mode = args.mode ?? 'production';
	console.warn(`Project running in ${mode.toUpperCase()} mode`);
	const PORT = process.env.PORT || 8080;
	console.info(`Server listening on port ${PORT}`);
});
server.on('close', () => {
	console.info('The server is stopping...');
});

/**
 * App HTTP server
 */
module.exports = server;
