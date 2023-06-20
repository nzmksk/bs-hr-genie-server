import express from "express";

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
