const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
  host: "postgres",
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

module.exports = pool;
