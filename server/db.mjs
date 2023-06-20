import pg from "pg";
const { Pool } = pg;
const env = process.env;

const pool = new Pool({
  host: "postgres",
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

export default pool;
