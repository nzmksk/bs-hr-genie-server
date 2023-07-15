const authRoutes = require("./api/AuthRouter.js");
const departmentRoutes = require("./api/DepartmentRouter.js");
const employeeRoutes = require("./api/EmployeeRouter.js");
const leaveQuotaRoutes = require("./api/LeaveQuotaRouter.js");
const leaveRoutes = require("./api/LeaveRouter.js");

module.exports = {
  authRoutes,
  departmentRoutes,
  employeeRoutes,
  leaveQuotaRoutes,
  leaveRoutes,
};
