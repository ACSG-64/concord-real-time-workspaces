require('dotenv').config(); // allows to read the variables defined in the .env file
const app = require('./app');
const orm = require('./db/orm');

/* Prepare the DB and start the server */
orm.sync()
    .then(() => app.listen(process.env.PORT || 8080))
    .catch((err) => console.error(err));
