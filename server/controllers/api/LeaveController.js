const pool = require("../../config/db.js");
const { LeaveApplicationModel } = require("../../models/models.js");
const psqlCrud = require("../../services/psql/crud.js");
const psqlQuery = require("../../services/psql/queries.js");

const getLeaveApplications = async (request, response) => {
  try {
    const [dataExists, results] = await psqlCrud.getLeaveApplications(
      request.employeeId
    );

    if (dataExists) {
      const data = results;
      return response.status(200).json({ data: data });
    } else {
      return response.status(404).json({ error: "Data not available." });
    }
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ error: "Internal server error" });
  }
};

const getLeaveApplicationsByDepartment = async (request, response) => {
  const departmentId = request.params.id;

  try {
    const [dataAvailable, leaveApplications] =
      await psqlCrud.getLeaveApplicationsByDepartment(
        departmentId,
        request.employeeId
      );

    if (dataAvailable) {
      return response.status(200).json({ data: leaveApplications });
    } else {
      return response
        .status(200)
        .json({ data: [], message: "No data available." });
    }
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const applyLeave = async (request, response) => {
  const leaveApplication = new LeaveApplicationModel(request.body);

  try {
    const data = await psqlCrud.applyLeave(leaveApplication);
    return response.status(201).json({
      data: data,
      message: "Leave application successfully submitted.",
    });
  } catch (error) {
    console.error(`applyLeave error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const approveRejectLeave = async (request, response) => {
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
