# Concord back-end
## Starting
**For development:** install all dependencies with the command. _SQLite will be the database to be used during development_.
```
npm install
```

**For production:** first install the client of your SQL database and then run
```
npm install --production
```

### Before running the project
Create a .env file with the following
```
NODE_ENV=
PORT=
DB_DIALECT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
```

In development, you just need to set the `PORT` variable and optionally set `NODE_ENV` to `development`.

In production, please set all variables accordingly:
* `NODE_ENV`: in production set to `production`.
* `PORT`: port where the server is going to listen.
* `DB_DIALECT`: `mysql` | `postgres` | `sqlite` | `mariadb` | `mssql` | `db2` | `snowflake` | `oracle`.
* `DB_USER`: database user to be connected.
* `DB_PASSWORD`: DB user password.
* `DB_HOST`: host of the DB.

### Running the project
In development use the command
```
npm run start-dev
```

In production use the command
```
npm start
```



