const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const accountRoutes = require("./routes/AccountRouter.js");
const departmentRoutes = require("./routes/DepartmentRouter.js");
const employeeRoutes = require("./routes/EmployeeRouter.js");
const leaveRoutes = require("./routes/LeaveRouter.js");

const app = express();
const port = process.env.HTTP_PORT ?? 3000;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", accountRoutes);
app.use("/departments", departmentRoutes);
app.use("/employees", employeeRoutes);
app.use("/leaves", leaveRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
