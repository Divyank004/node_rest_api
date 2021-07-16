const Pool = require("pg").Pool;

const config = require("config");
const debug = require("debug")("app:db");

const pool = new Pool({
  user: config.get("postgres.user"),
  host: config.get("postgres.host"),
  database: config.get("postgres.database"),
  password: config.get("postgres.password"),
  port: config.get("postgres.port"),
});

module.exports = {
  debug,
  pool,
};
