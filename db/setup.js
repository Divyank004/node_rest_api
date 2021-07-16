const pgp = require("pg-promise")();

const config = require("config");
const debug = require("debug")("app:db");

const connection = {
  user: config.get("postgres.user"),
  host: config.get("postgres.host"),
  database: config.get("postgres.database"),
  password: config.get("postgres.password"),
  port: config.get("postgres.port"),
};

const db = pgp(connection);
debug(`DB connection established`);
module.exports = {
  debug,
  db,
};
