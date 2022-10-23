const Sequelize = require('sequelize');

if ((process.env.NODE_ENV).toLowerCase() === 'production') {
	const { DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, DB_HOST } = process.env;
	module.exports = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
		dialect: DB_DIALECT,
		host: DB_HOST,
	});
} else {
	// Using SQLite for development
	module.exports = new Sequelize({
		dialect: 'sqlite',
		storage: 'dev_db.sqlite', // this will create a file with that name
	});
}
