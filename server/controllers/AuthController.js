const pool = require("../config/db.js");
const queries = require("../utils/queries/queries.js");
const { EmployeeModel } = require("../models/models.js");

const logoutAccount = async (request, response) => {
  response.clearCookie("hr-genie", { path: "/refresh_token" });
  return response.status(200).json({ message: "Logout successful." });
};

const registerNewEmployee = async (request, response) => {
  try {
    const employee = new EmployeeModel(request.body);
    const emailExistsQuery = {
      text: queries.getEmployeeByEmail,
      values: [employee.cleanEmail],
    };
    const emailExistsResult = await pool.query(emailExistsQuery);

    if (emailExistsResult.rows.length > 0) {
      return response
        .status(409)
        .json({ message: "Email is already registered." });
    } else {
      const registerEmployeeQuery = {
        text: queries.registerNewEmployee,
        values: [
          employee.departmentId,
          employee.employeeRole,
          employee.firstName,
          employee.lastName,
          employee.gender,
          employee.email,
          employee.nric,
          await employee.encryptPassword(),
        ],
      };
      await pool.query(registerEmployeeQuery);

      return response
        .status(201)
        .json({ message: "Account successfully registered." });
    }
  } catch (error) {
    let statusCode;
    let message;

    switch (error.code) {
      case "23502":
        statusCode = 400;
        message = "Null value error.";
        break;
      case "23503":
        statusCode = 400;
        message = "Invalid department ID.";
        break;
      case "23505":
        statusCode = 400;
        message = "Email is already registered.";
        break;
      default:
        statusCode = 500;
        message = `${error.message}`;
        break;
    }

    return response.status(statusCode).json({ message });
  }
};

module.exports = {
  logoutAccount,
  registerNewEmployee,
};
