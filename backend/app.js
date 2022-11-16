require('dotenv').config(); // allows to read the variables defined in the .env file
const args = require('./utils/args');
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { authEndpoint } = require('./api/index');

/* Configure the server */
const app = express();
const server = createServer(app);

/* Set the public folder to serve static content */
app.use(express.static(path.join(__dirname, 'public')));

/* Configure global middlewares */
app.use(helmet()); // set HTTP security headers
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

/* Set the API endpoints */
app.use('/api/auth', authEndpoint);

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