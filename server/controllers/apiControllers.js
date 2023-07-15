const authController = require("./api/AuthController.js");
const departmentController = require("./api/DepartmentController.js");
const employeeController = require("./api/EmployeeController.js");
const leaveController = require("./api/LeaveController.js");
const leaveQuotaController = require("./api/LeaveQuotaController.js");

module.exports = {
  authController,
  departmentController,
  employeeController,
  leaveController,
  leaveQuotaController,
};
