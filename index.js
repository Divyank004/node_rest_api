const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("config");
const debug = require("debug")("app:startup");
const routers = require("./routes/routers");
const app = express();

app.use(express.json());
// set http headers like CSP, XSSfilter to secure the api
app.use(helmet());
app.use("/", routers);
debug(config.get("name"));

// checks NODE_ENV environment variable - default development
if (app.get("env") === "development") {
  // log all incoming http requests
  app.use(morgan("short"));
  debug("Logging enabled");
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  debug(`Application is up and running at http://localhost:${port}`)
);
