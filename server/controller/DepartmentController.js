const pool = require("../app_config/db.js");
const queries = require("../queries/queries.js");

const getDepartments = (request, response) => {
  pool.query(queries.getDepartments, (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    }
    response.status(200).json({ data: results.rows });
  });
};

module.exports = {
  getDepartments,
};
