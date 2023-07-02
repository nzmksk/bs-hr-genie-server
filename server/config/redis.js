const redis = require("redis");

const host = "redis";
const username = process.env.REDIS_USER;
const password = process.env.REDIS_PASSWORD;
const db = process.env.REDIS_DB;
const port = process.env.REDIS_PORT;

const client = redis.createClient({
  host: host,
  port: port,
  username: username,
  password: password,
  db: db,
});

const redisClient = async () => await client.connect();

module.exports = redisClient;
