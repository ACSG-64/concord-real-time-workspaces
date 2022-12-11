require('dotenv').config(); // allows to read the variables defined in the .env file
const args = require('./utils/args');
const express = require('express');
const { createServer } = require('http');
const path = require('path');

const { authEndpoint, accountEndpoint, workspaceEndpoint } = require('./api/index');

/* Configure the server */
const app = express();
const server = createServer(app);

/* Set the public folder to serve static content */
app.use(express.static(path.join(__dirname, 'public')));

/* Configure global middlewares */
app.use(require('helmet')()); // set HTTP security headers
app.use(require('compression')()); // compress all the responses to reduce bandwidth usage
// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('cookie-parser')());

/* Set the API endpoints */
app.use('/api/auth', authEndpoint);
app.use('/api/account', accountEndpoint);
app.use('/api/workspace/', workspaceEndpoint);

/* Server events */
server.on('listening', () => {
    if (!args.silent) {
        const mode = args.mode ?? 'production';
        console.warn(`Project running in ${mode.toUpperCase()} mode`);
        const PORT = process.env.PORT || 8080;
        console.info(`Server listening on port ${PORT}`);
    }
});
server.on('close', () => {
    if (!args.silent) {
        console.info('The server is stopping...');
    }
});

/**
 * App HTTP server
 */
module.exports = server;