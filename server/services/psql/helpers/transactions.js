const pool = require("../../../config/db.js");

const psqlTransaction = async (queryObjectsArray) => {
  try {
    await pool.query("BEGIN");
    for (const queryObject of queryObjectsArray) {
      await pool.query(queryObject);
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw new Error(`psqlTransaction error: ${error.message}`);
  }
};

module.exports = psqlTransaction;
