const psqlQuery = require("./queries.js");
const pool = require("../../config/db.js");
const { EmployeeModel } = require("../../models/models.js");

const checkIfEmailExists = async (email) => {
  try {
    let employee;
    const query = {
      text: psqlQuery.getEmployeeByEmail,
      values: [email],
    };
    const results = await pool.query(query);
    const emailExists = results.rows.length > 0;

    if (emailExists) {
      employee = new EmployeeModel(results.rows[0]);
    }

    return [emailExists, employee];
  } catch (error) {
    throw new Error(`checkIfEmailExists error: ${error.message}`);
  }
};

const checkIfLeaveQuotaAvailable = async (
  leaveTypeId,
  employeeId,
  durationLength
) => {
  let quota;
  const query = {
    text: psqlQuery.getLeaveQuota,
    values: [leaveTypeId, employeeId],
  };

  try {
    const results = await pool.query(query);
    if (results.rows.length > 0) {
      quota = results.rows[0].quota;
    }

    return quota > durationLength;
  } catch (error) {
    throw new Error(`checkIfLeaveQuotaAvailable error: ${error.message}`);
  }
};

const checkIfNricExists = async (nric) => {
  try {
    const query = {
      text: psqlQuery.getEmployeeByNric,
      values: [nric],
    };
    const results = await pool.query(query);

    return results.rows.length > 0;
  } catch (error) {
    throw new Error(`checkIfNricExists error: ${error.message}`);
  }
};

module.exports = {
  checkIfEmailExists,
  checkIfLeaveQuotaAvailable,
  checkIfNricExists,
};
