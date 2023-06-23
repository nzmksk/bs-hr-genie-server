const express = require("express");
const homeRoutes = require("./routes/HomeRouter.js");
const departmentRoutes = require("./routes/DepartmentRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());
app.use("/", homeRoutes);
app.use("/departments", departmentRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
