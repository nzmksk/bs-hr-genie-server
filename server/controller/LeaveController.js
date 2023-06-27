const pool = require("../app_config/db.js");
const queries = require("../queries/queries.js");

const getLeaveApplications = (request, response) => {
  pool.query(queries.getLeaveApplications, (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    } else if (results.rows.length > 0) {
      const leaveApplications = results.rows;
      return response.status(200).json({ data: leaveApplications });
    } else {
      return response
        .status(200)
        .json({ data: [], message: "No data available." });
    }
  });
};

const getLeaveApplicationsByDepartment = (request, response) => {
  const departmentID = request.params.id;
  pool.query(
    queries,
    getLeaveApplicationsByDepartment,
    [departmentID],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else if (results.rows.length > 0) {
        const leaveApplications = results.rows;
        return response.status(200).json({ data: leaveApplications });
      } else {
        return response
          .status(200)
          .json({ data: [], message: "No data available." });
      }
    }
  );
};

module.exports = { getLeaveApplications, getLeaveApplicationsByDepartment };
