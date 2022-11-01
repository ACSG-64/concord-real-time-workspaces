# Concord back-end
## Starting
**For development:** install all dependencies with the command. _In this case we will use SQLite as our database_.
```
npm install
```

**For production:** first install the Node.js client of your SQL database and then run
```
npm install --production
```

## Before running the project
Create a .env file with the following
```
PORT=
DB_DIALECT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
```

In development, you just need to set the `PORT` variable.

In production, please set all variables accordingly:
* `PORT`: port where the server is going to listen.
* `DB_DIALECT`: `mysql` | `postgres` | `sqlite` | `mariadb` | `mssql` | `db2` | `snowflake` | `oracle`.
* `DB_USER`: database user to be connected.
* `DB_PASSWORD`: DB user password.
* `DB_HOST`: host of the DB.

## Running the project
In development use the command
```
npm run dev
```

In production use the command
```
npm start
```

### Arguments
* Mode: `<command> --mode=<development | testing | production>`
  


