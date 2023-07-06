const redis = require("redis");

const host = "redis";
const password = process.env.REDIS_PASSWORD;
const port = process.env.REDIS_PORT;

const client = redis.createClient({
  url: `redis://default:${password}@${host}:${port}`,
});

client.on("error", (error) => {
  console.error(error);
});

(async () => await client.connect())();

module.exports = client;
