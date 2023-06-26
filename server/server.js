const express = require("express");
const departmentRoutes = require("./routes/DepartmentRouter.js");
const employeeRoutes = require("./routes/EmployeeRouter.js");
const homeRoutes = require("./routes/HomeRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());
app.use("/", homeRoutes);
app.use("/employees", employeeRoutes);
app.use("/departments", departmentRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
