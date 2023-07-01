const queries = require("../utils/queries/queries.js");
const {
  AnnualLeaveQuotaModel,
  EmergencyLeaveQuotaModel,
  EmployeeModel,
  MedicalLeaveQuotaModel,
  ParentalLeaveQuotaModel,
  UnpaidLeaveQuotaModel,
} = require("../models/models.js");
const { makeTransaction } = require("../utils/transactions.js/transactions.js");
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
    const annualLeave = new AnnualLeaveQuotaModel(employee);
    const medicalLeave = new MedicalLeaveQuotaModel(employee);
    const parentalLeave = new ParentalLeaveQuotaModel(employee);
    const emergencyLeave = new EmergencyLeaveQuotaModel(employee);
    const unpaidLeave = new UnpaidLeaveQuotaModel(employee);

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

    // Allocate leave quota
    const allocateAnnualLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        annualLeave.employeeId,
        annualLeave.leaveTypeId,
        annualLeave.quota,
      ],
    };
    const allocateMedicalLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        medicalLeave.employeeId,
        medicalLeave.leaveTypeId,
        medicalLeave.quota,
      ],
    };
    const allocateParentalLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        parentalLeave.employeeId,
        parentalLeave.leaveTypeId,
        parentalLeave.quota,
      ],
    };
    const allocateEmergencyLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        emergencyLeave.employeeId,
        emergencyLeave.leaveTypeId,
        emergencyLeave.quota,
      ],
    };
    const allocateUnpaidLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        unpaidLeave.employeeId,
        unpaidLeave.leaveTypeId,
        unpaidLeave.quota,
      ],
    };

    // Perform transaction
    const { statusCode, successMessage, errorMessage } = await makeTransaction(
      [
        registerEmployeeQuery,
        allocateAnnualLeaveQuery,
        allocateMedicalLeaveQuery,
        allocateParentalLeaveQuery,
        allocateEmergencyLeaveQuery,
        allocateUnpaidLeaveQuery,
      ],
      201,
      "Account successfully registered."
    );

    return response
      .status(statusCode)
      .json({ message: successMessage, error: errorMessage });
  } catch (error) {
    return response.status(500).json({ error: `${error.message}` });
  }
};

module.exports = {
  logoutAccount,
  registerNewEmployee,
};
