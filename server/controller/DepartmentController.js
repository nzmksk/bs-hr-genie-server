const pool = require("../db.js");
const queries = require("../queries/queries.js");

const getDepartments = (request, response) => {
  pool.query(queries.getDepartments, (error, results) => {
    if (error) throw error;
    response.status(200).json(results.rows);
  });
};

module.exports = {
  getDepartments,
};
