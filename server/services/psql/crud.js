const pool = require("../../config/db.js");
const {
  EmployeeModel,
  LeaveApplicationModel,
  GeneralLeaveQuotaModel,
} = require("../../models/models.js");
const generateAllocateLeaveQuery = require("./helpers/generateAllocateLeaveQuery.js");
const psqlTransaction = require("./helpers/transactions.js");
const psqlQuery = require("./queries.js");

const allocateLeaves = async (
  annualLeave,
  medicalLeave,
  parentalLeave,
  emergencyLeave,
  unpaidLeave
) => {
  const queryObjectsArray = generateAllocateLeaveQuery(
    annualLeave,
    medicalLeave,
    parentalLeave,
    emergencyLeave,
    unpaidLeave
  );

  try {
    await psqlTransaction(queryObjectsArray);
  } catch (error) {
    throw new Error(`crud.allocateLeaves error: ${error.message}`);
  }
};

const applyLeave = async (leaveApplication) => {
  const query = {
    text: psqlQuery.applyLeave,
    values: [
      leaveApplication.employeeId,
      leaveApplication.leaveTypeId,
      leaveApplication.startDate,
      leaveApplication.endDate,
      leaveApplication.duration,
      leaveApplication.calculateDuration(),
      leaveApplication.reason,
      leaveApplication.attachment,
    ],
  };

  try {
    const results = await pool.query(query);
    const leaveApplication = new LeaveApplicationModel(results.rows[0]);

    return leaveApplication;
  } catch (error) {
    throw new Error(`crud.applyLeave error: ${error.message}`);
  }
};

const approveRejectLeave = async (
  applicationStatus,
  employeeId,
  rejectReason,
  leaveId
) => {
  const query = {
    text: psqlQuery.approveRejectLeave,
    values: [applicationStatus, employeeId, rejectReason, leaveId],
  };

  try {
    const results = await pool.query(query);
    const leaveApplication = new LeaveApplicationModel(results.rows[0]);

    return leaveApplication;
  } catch (error) {
    throw new Error(`crud.approveRejectLeave error: ${error.message}`);
  }
};

const deleteLeaveApplication = async (leaveId) => {
  const query = {
    text: psqlQuery.deleteLeaveApplication,
    values: [leaveId],
  };

  try {
    const results = await pool.query(query);
    const leaveApplication = new LeaveApplicationModel(results.rows[0]);

    return leaveApplication;
  } catch (error) {
    throw new Error(`crud.deleteLeaveApplication error: ${error.message}`);
  }
};

const getEmployees = async () => {
  let data;
  const query = { text: psqlQuery.getEmployees };

  try {
    const results = await pool.query(query);

    if (results.rows.length > 0) {
      data = results.rows.map((employee) => {
        const employeeObj = new EmployeeModel(employee);
        return employeeObj;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`crud.getEmployees error: ${error.message}`);
  }
};

const getLeaveApplications = async (employeeId) => {
  let data;
  const query = {
    text: psqlQuery.getLeaveApplications,
    values: [employeeId],
  };

  try {
    const results = await pool.query(query);
    const dataAvailable = results.rows.length > 0;

    if (dataAvailable) {
      data = results.rows.map((leaveItem) => {
        const leaveApplication = new LeaveApplicationModel(leaveItem);
        return leaveApplication;
      });
    }

    return [dataAvailable, data];
  } catch (error) {
    throw new Error(`crud.getLeaveApplications error: ${error.message}`);
  }
};

const getLeaveApplicationsByDepartment = async (departmentId, employeeId) => {
  let data;
  const query = {
    text: psqlQuery.getLeaveApplicationsByDepartment,
    values: [departmentId, employeeId],
  };

  try {
    const results = await pool.query(query);
    const dataAvailable = results.rows.length > 0;

    if (dataAvailable) {
      data = results.rows.map((leaveItem) => {
        const leaveApplication = new LeaveApplicationModel(leaveItem);
        return leaveApplication;
      });
    }

    return [dataAvailable, data];
  } catch (error) {
    throw new Error(
      `crud.getLeaveApplicationsByDepartment error: ${error.message}`
    );
  }
};

const getLeaveCount = async (employeeId) => {
  let data;
  const query = {
    text: psqlQuery.getLeaveCount,
    values: [employeeId],
  };

  try {
    const results = await pool.query(query);
    const dataAvailable = results.rows.length > 0;

    if (dataAvailable) {
      data = results.rows.map((leaveType) => {
        const leaveObject = new GeneralLeaveQuotaModel(leaveType);
        return leaveObject;
      });
    }

    return [dataAvailable, data];
  } catch (error) {
    throw new Error(`crud.getLeaveCount error: ${error.message}`);
  }
};

const registerEmployee = async (employeeObj) => {
  const query = {
    text: psqlQuery.registerNewEmployee,
    values: [
      employeeObj.departmentId,
      employeeObj.employeeRole,
      employeeObj.firstName,
      employeeObj.lastName,
      employeeObj.gender,
      employeeObj.email,
      employeeObj.position,
      employeeObj.phone,
      employeeObj.nric,
      employeeObj.isMarried,
      employeeObj.joinedDate,
      await employeeObj.encryptPassword(employeeObj.nric),
    ],
  };

  try {
    let newEmployee;

    const results = await pool.query(query);

    if (results.rows.length > 0) {
      newEmployee = new EmployeeModel(results.rows[0]);
    }

    return newEmployee;
  } catch (error) {
    throw new Error(`crud.registerEmployee error: ${error.message}`);
  }
};

const updateLeaveQuotaApproved = async (employeeId, leaveTypeId) => {
  const query = {
    text: psqlQuery.updateLeaveQuotaApproved,
    values: [employeeId, leaveTypeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateLeaveQuotaApproved error: ${error.message}`);
  }
};

const updateLeaveQuotaCancelled = async (employeeId, leaveTypeId) => {
  const query = {
    text: psqlQuery.updateLeaveQuotaCancelled,
    values: [employeeId, leaveTypeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateLeaveQuotaCancelled error: ${error.message}`);
  }
};

const updatePasswordFirstTime = async (hashedPassword, employeeId) => {
  const query = {
    text: psqlQuery.updatePasswordFirstTime,
    values: [hashedPassword, employeeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updatePasswordFirstTime error: ${error.message}`);
  }
};

const updateStatusToOffline = async (employeeId) => {
  const query = {
    text: psqlQuery.updateStatusToOffline,
    values: [employeeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateStatusToOffline error: ${error.message}`);
  }
};

const updateStatusToOnline = async (employeeId) => {
  const query = {
    text: psqlQuery.updateStatusToOnline,
    values: [employeeId],
  };

  try {
    await pool.query(query);
  } catch (error) {
    throw new Error(`crud.updateStatusToOnline error: ${error.message}`);
  }
};

module.exports = {
  allocateLeaves,
  applyLeave,
  approveRejectLeave,
  deleteLeaveApplication,
  getEmployees,
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
  getLeaveCount,
  registerEmployee,
  updateLeaveQuotaApproved,
  updateLeaveQuotaCancelled,
  updatePasswordFirstTime,
  updateStatusToOffline,
  updateStatusToOnline,
};
