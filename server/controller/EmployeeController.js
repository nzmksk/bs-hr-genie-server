const pool = require("../app_config/db.js");
const queries = require("../queries/queries.js");

const getEmployees = (request, response) => {
  pool.query(queries.getEmployees, (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    } else {
      let employees = results.rows;
      return response.status(200).json({ data: employees });
    }
  });
};

module.exports = { getEmployees };
