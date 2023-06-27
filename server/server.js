const express = require("express");
const departmentRoutes = require("./routes/DepartmentRouter.js");
const employeeRoutes = require("./routes/EmployeeRouter.js");
const accountRoutes = require("./routes/AccountRouter.js");
const leaveRoutes = require("./routes/LeaveRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(express.json());
app.use("/", accountRoutes);
app.use("/departments", departmentRoutes);
app.use("/employees", employeeRoutes);
app.use("/leaves", leaveRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
