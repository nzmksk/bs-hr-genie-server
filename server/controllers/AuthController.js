const pool = require("../config/db.js");
const queries = require("../utils/queries/queries.js");
const { EmployeeModel } = require("../models/models.js");
const {
  checkIfEmailExists,
  checkIfNricExists,
} = require("../utils/validations/validations.js");

const logoutAccount = async (request, response) => {
  response.clearCookie("hr-genie", { path: "/refresh_token" });
  return response.status(200).json({ message: "Logout successful." });
};

const registerNewEmployee = async (request, response) => {
  try {
    const employee = new EmployeeModel(request.body);

    // Check if email exists
    const [emailStatusCode, emailErrorMessage] = await checkIfEmailExists(
      employee.email
    );
    if (emailStatusCode && emailErrorMessage) {
      return response
        .status(emailStatusCode)
        .json({ error: emailErrorMessage });
    }

    // Check if NRIC exists
    const [nricStatusCode, nricErrorMessage] = await checkIfNricExists(
      employee.nric
    );
    if (nricStatusCode && nricErrorMessage) {
      return response.status(nricStatusCode).json({ error: nricErrorMessage });
    }

    // Register new account
    const registerEmployeeQuery = {
      text: queries.registerNewEmployee,
      values: [
        employee.departmentId,
        employee.employeeRole,
        employee.firstName,
        employee.lastName,
        employee.gender,
        employee.email,
        employee.phone,
        employee.nric,
        employee.isMarried,
        employee.joinedDate,
        await employee.encryptPassword(),
      ],
    };
    await pool.query(registerEmployeeQuery);

    return response
      .status(201)
      .json({ message: "Account successfully registered." });
  } catch (error) {
    return response.status(500).json({ error: `${error.message}` });
  }
};

module.exports = {
  logoutAccount,
  registerNewEmployee,
};
