const { LeaveApplicationModel } = require("../../models/models.js");
const psqlCrud = require("../../services/psql/crud.js");
const psqlValidate = require("../../services/psql/validations.js");

const applyLeave = async (request, response) => {
  const leaveApplication = new LeaveApplicationModel(request.body);
  leaveApplication.employeeId = request.employeeId;

  try {
    const isWithinQuota = await psqlValidate.checkIfLeaveQuotaAvailable(
      leaveApplication.leaveTypeId,
      leaveApplication.employeeId,
      leaveApplication.durationLength
    );

    if (isWithinQuota) {
      const isAlreadyApplied = await psqlCrud.getLeaveApplicationsByDate(
        leaveApplication.employeeId,
        leaveApplication.startDate,
        leaveApplication.endDate
      );

      if (isAlreadyApplied) {
        return response
          .status(400)
          .json({ error: "You already applied leave(s) on this date." });
      }

      const data = await psqlCrud.applyLeave(leaveApplication);
      return response.status(201).json({
        data: data,
        message: "Leave application successfully submitted.",
      });
    } else {
      return response.status(400).json({
        error: "You cannot apply more than allocated.",
      });
    }
  } catch (error) {
    console.error(`applyLeave error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const approveRejectLeave = async (request, response) => {
  const leaveId = request.params.id.toUpperCase();
  const employeeId = request.employeeId;
  const { applicationStatus, rejectReason } = request.body;

  try {
    const data = await psqlCrud.approveRejectLeave(
      applicationStatus,
      employeeId,
      rejectReason,
      leaveId
    );

    if (data.applicationStatus === "approved") {
      if (data.leaveTypeId === 1 || data.leaveTypeId === 4) {
        await psqlCrud.updateLeaveQuotaApproved(
          parseInt(data.durationLength),
          data.employeeId,
          1
        );
        await psqlCrud.updateLeaveQuotaApproved(
          parseInt(data.durationLength),
          data.employeeId,
          4
        );
      } else {
        await psqlCrud.updateLeaveQuotaApproved(
          parseInt(data.durationLength),
          data.employeeId,
          data.leaveTypeId
        );
      }
    } else if (data.applicationStatus === "cancelled") {
      if (data.leaveTypeId === 1 || data.leaveTypeId === 4) {
        await psqlCrud.updateLeaveQuotaCancelled(
          parseInt(data.durationLength),
          data.employeeId,
          1
        );
        await psqlCrud.updateLeaveQuotaCancelled(
          parseInt(data.durationLength),
          data.employeeId,
          4
        );
      } else {
        await psqlCrud.updateLeaveQuotaCancelled(
          parseInt(data.durationLength),
          data.employeeId,
          data.leaveTypeId
        );
      }
    }

    return response.status(200).json({
      data: data,
      message: `Leave application ${data.applicationStatus} successfully.`,
    });
  } catch (error) {
    console.error(`approveRejectLeave error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const cancelApplication = async (request, response) => {
  const leaveId = request.params.id.toUpperCase();
  const applicationStatus = "cancelled";

  try {
    const data = await psqlCrud.cancelApplication(applicationStatus, leaveId);

    return response.status(200).json({
      data: data,
      message: `Leave application ${data.applicationStatus} successfully.`,
    });
  } catch (error) {
    console.error(`cancelApplication error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const deleteLeaveApplication = async (request, response) => {
  const leaveId = request.params.id;
  try {
    const data = await psqlCrud.deleteLeaveApplication(leaveId);
    return response
      .status(204)
      .json({ data: data, message: "Data deleted successfully." });
  } catch (error) {
    console.error(`deleteLeaveApplication error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const getLeaveApplications = async (request, response) => {
  try {
    const [dataExists, results] = await psqlCrud.getLeaveApplications(
      request.employeeId
    );

    if (dataExists) {
      return response.status(200).json({ data: results });
    } else {
      return response.status(404).json({ error: "Data not available." });
    }
  } catch (error) {
    console.error(`getLeaveApplications error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error" });
  }
};

const getLeaveApplicationsByDepartment = async (request, response) => {
  const departmentId = request.params.id.toUpperCase();

  try {
    const [dataAvailable, leaveApplications] =
      await psqlCrud.getLeaveApplicationsByDepartment(
        departmentId,
        request.employeeId
      );

    if (dataAvailable) {
      return response.status(200).json({ data: leaveApplications });
    } else {
      return response.status(404).json({ error: "Data not available." });
    }
  } catch (error) {
    console.error(`getLeaveApplicationsByDepartment error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const getLeaveCount = async (request, response) => {
  try {
    const [dataAvailable, leaveCounts] = await psqlCrud.getLeaveCount(
      request.employeeId
    );

    if (dataAvailable) {
      return response.status(200).json({ data: leaveCounts });
    } else {
      return response.status(404).json({ error: "Data not available." });
    }
  } catch (error) {
    console.error(`getLeaveCount error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  applyLeave,
  approveRejectLeave,
  cancelApplication,
  deleteLeaveApplication,
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
  getLeaveCount,
};
