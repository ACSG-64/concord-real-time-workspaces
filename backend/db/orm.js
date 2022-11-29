const Sequelize = require('sequelize');
const args = require('../utils/args');

if ((args.mode)?.toLowerCase() === 'development') {
    module.exports = new Sequelize({
        dialect: 'sqlite', // using SQLite for development
        storage: 'dev_db.sqlite', // this will create a file with that name
        logging: !args.silent,
    });
} else if ((args.mode)?.toLowerCase() === 'testing') {
    module.exports = new Sequelize('sqlite::memory:', { logging: !args.silent }); // this will initialize a SQLite DB in memory
} else {
    const { DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, DB_HOST } = process.env;
    module.exports = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        dialect: DB_DIALECT,
        host: DB_HOST,
        logging: false,
    });
}
