const express = require("express");
const departmentRoutes = require("./routes/DepartmentRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/department", departmentRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
