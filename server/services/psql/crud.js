const pool = require("../../config/db.js");
const { EmployeeModel } = require("../../models/models.js");
const generateAllocateLeaveQuery = require("./helpers/generateAllocateLeaveQuery.js");
const psqlTransaction = require("./helpers/transactions.js");
const psqlQuery = require("./queries.js");

const allocateLeaves = async (
  annualLeave,
  medicalLeave,
  parentalLeave,
  emergencyLeave,
  unpaidLeave
) => {
  const queryObjectsArray = generateAllocateLeaveQuery(
    annualLeave,
    medicalLeave,
    parentalLeave,
    emergencyLeave,
    unpaidLeave
  );

  try {
    await psqlTransaction(queryObjectsArray);
  } catch (error) {
    throw new Error(`crud.allocateLeaves error: ${error.message}`);
  }
};

const registerEmployee = async (employeeObj) => {
  const query = {
    text: psqlQuery.registerNewEmployee,
    values: [
      employeeObj.departmentId,
      employeeObj.employeeRole,
      employeeObj.firstName,
      employeeObj.lastName,
      employeeObj.gender,
      employeeObj.email,
      employeeObj.position,
      employeeObj.phone,
      employeeObj.nric,
      employeeObj.isMarried,
      employeeObj.joinedDate,
      await employeeObj.encryptPassword(employeeObj.nric),
    ],
  };

  try {
    let newEmployee;

    const results = await pool.query(query);

    if (results.rows.length > 0) {
      newEmployee = new EmployeeModel(results.rows[0]);
    }

    return newEmployee;
  } catch (error) {
    throw new Error(`crud.registerEmployee error: ${error.message}`);
  }
};

const updateStatusToOffline = async (employeeId) => {
  const query = {
    text: psqlQuery.updateStatusToOffline,
    values: [employeeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateStatusToOffline error: ${error.message}`);
  }
};

const updateStatusToOnline = async (employeeId) => {
  const query = {
    text: psqlQuery.updateStatusToOnline,
    values: [employeeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateStatusToOnline error: ${error.message}`);
  }
};

module.exports = {
  allocateLeaves,
  registerEmployee,
  updateStatusToOffline,
  updateStatusToOnline,
};
