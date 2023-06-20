import express from "express";
import Users from "./users.mjs";
import database from "./db.mjs";

const users = new Users(database);

const app = express();
app.use(express.json());
app
  .get("/", function (req, res) {
    res.send("Hello world");
  })
  .post("/users", async function (req, res) {
    await users.add(req, res);
  })
  .get("/users", function (req, res) {
    users.list(req, res);
  })
  .get("/users/:email", async function (req, res) {
    await users.get(req, res);
  })
  .delete("/users", async function (req, res) {
    await users.delete(req, res);
  });

const port = process.env.HTTP_PORT || 3000;
console.log(`Server is listening on http://localhost:${port}\n`);
app.listen(port);
