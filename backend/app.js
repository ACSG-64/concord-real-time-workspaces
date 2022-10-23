require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const orm = require('./db/orm');

/* Configure the server */
const app = express();
const server = createServer(app);

/* Configure global middlewares */
app.use(helmet()); // Set HTTP security headers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/* Prepare the DB and start the server */
orm.sync()
	.then(() => {
		const mode = (process.env.NODE_ENV).toLowerCase() === 'production' ? 'PRODUCTION' : 'DEVELOPMENT';
		console.warn(`Project running in ${mode} mode`);
		const PORT = process.env.PORT || 8080;
		server.listen(PORT, () => console.log(`Server listening in port ${PORT}`));
	});	
