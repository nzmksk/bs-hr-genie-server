const psqlQuery = require("../../services/psql/queries.js");
const pool = require("../../config/db.js");
const { LeaveApplicationModel } = require("../../models/models.js");

const getLeaveApplications = async (request, response) => {
  try {
    const query = {
      text: psqlQuery.getLeaveApplications,
      values: [request.employeeId],
    };
    const result = await pool.query(query);
    const leaveApplicationsArray = result.rows;

    if (leaveApplicationsArray.length > 0) {
      const data = leaveApplicationsArray.map((leaveApplication) => {
        const leaveObject = new LeaveApplicationModel(leaveApplication);
        return leaveObject;
      });

      return response.status(200).json({ data: data });
    } else {
      return response.status(404).json({ error: "Data not available." });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

const getLeaveApplicationsByDepartment = (request, response) => {
  const departmentID = request.params.id;
  pool.query(
    psqlQuery.getLeaveApplicationsByDepartment,
    [departmentID.toUpperCase()],
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
  console.log(departmentID.toUpperCase());
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
    psqlQuery.applyLeave,
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

const approveRejectLeave = (request, response) => {
  const leave_id = request.params.id;
  const {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    reason,
    attachment,
    application_status,
    approved_rejected_by,
    reject_reason,
  } = request.body;
  pool.query(
    psqlQuery.approveRejectLeave,
    [
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      duration,
      reason,
      attachment,
      application_status,
      approved_rejected_by,
      reject_reason,
      leave_id,
    ],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else {
        let leaveApplication = results.rows[0];
        return response
          .status(200)
          .json({ message: "Data updated successfully." });
      }
    }
  );
};

const deleteLeaveApplication = (request, response) => {
  const leave_id = request.params.id;
  try {
    let leaveApplication;
    pool.query("BEGIN");
    pool.query(
      psqlQuery.deleteLeaveApplication,
      [leave_id],
      (error, results) => {
        leaveApplication = results.rows[0];
      }
    );
    pool.query("COMMIT");
    return response
      .status(200)
      .json({ data: leaveApplication, message: "Data deleted successfully." });
  } catch (error) {
    console.error(error);
    pool.query("ROLLBACK");
    return response.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  applyLeave,
  approveRejectLeave,
  deleteLeaveApplication,
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
};