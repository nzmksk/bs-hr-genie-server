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

const applyLeave = (request, response) => {
  const {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    reason,
    attachment,
  } = request.body;
  pool.query(
    queries.applyLeave,
    [
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      duration,
      reason,
      attachment,
    ],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else {
        const leaveApplication = results.rows[0];
        return response.status(201).json({
          data: leaveApplication,
          message: "Leave application successfully submitted.",
        });
      }
    }
  );
};

module.exports = {
  applyLeave,
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
};
