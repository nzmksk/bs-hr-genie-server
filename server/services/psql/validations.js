const psqlQuery = require("./queries.js");
const pool = require("../../config/db.js");

const checkIfEmailExists = async (email) => {
  try {
    const query = {
      text: psqlQuery.getEmployeeByEmail,
      values: [email],
    };
    const result = await pool.query(query);

    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`checkIfEmailExists error: ${error.message}`);
  }
};

const checkIfNricExists = async (nric) => {
  try {
    const query = {
      text: psqlQuery.getEmployeeByNric,
      values: [nric],
    };
    const result = await pool.query(query);

    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`checkIfNricExists error: ${error.message}`);
  }
};

module.exports = { checkIfEmailExists, checkIfNricExists };
