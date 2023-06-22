const express = require("express");
const adminRoutes = require("./routes/AdminRouter.js");
const departmentRoutes = require("./routes/DepartmentRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/department", departmentRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
