const pool = require("../db.js");
const queries = require("../queries/queries.js");

const getDepartments = (req, res) => {
  pool.query(queries.getDepartments, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

module.exports = {
  getDepartments,
};
