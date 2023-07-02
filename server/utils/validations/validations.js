const queries = require("../queries/queries.js");
const { pool } = require("../../config/config.js");

const checkIfEmailExists = async (email) => {
  let statusCode;
  let errorMessage;

  try {
    const emailExistsQuery = {
      text: queries.getEmployeeByEmail,
      values: [email],
    };
    const emailExistsResult = await pool.query(emailExistsQuery);

    if (emailExistsResult.rows.length > 0) {
      statusCode = 409;
      errorMessage = "Email is already registered.";
    }
  } catch (error) {
    statusCode = 500;
    errorMessage = error.message;
  } finally {
    return [statusCode, errorMessage];
  }
};

const checkIfNricExists = async (nric) => {
  let statusCode;
  let errorMessage;

  try {
    const nricExistsQuery = {
      text: queries.getEmployeeByNric,
      values: [nric],
    };
    const nricExistsResult = await pool.query(nricExistsQuery);

    if (nricExistsResult.rows.length > 0) {
      statusCode = 409;
      errorMessage = "NRIC is already registered.";
    }
  } catch (error) {
    statusCode = 500;
    errorMessage = error.message;
  } finally {
    return [statusCode, errorMessage];
  }
};

module.exports = { checkIfEmailExists, checkIfNricExists };
