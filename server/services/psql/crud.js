const pool = require("../../config/db.js");
const {
  EmployeeModel,
  LeaveApplicationModel,
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

const getLeaveApplications = async (employeeId) => {
  let data;
  const query = {
    text: psqlQuery.getLeaveApplications,
    values: [employeeId],
  };

  try {
    const results = await pool.query(query);
    const dataExists = results.rows.length > 0;

    if (dataExists) {
      data = results.rows.map((leaveItem) => {
        const leaveApplication = new LeaveApplicationModel(leaveItem);
        return leaveApplication;
      });
    }

    return [dataExists, data];
  } catch (error) {
    throw new Error(`crud.getLeaveApplications error: ${error.message}`);
  }
};

const getLeaveApplicationsByDepartment = async (departmentId) => {
  const query = {
    text: psqlQuery.getLeaveApplicationsByDepartment,
    values: [departmentId.toUpperCase()],
  };

  try {
    const results = await pool.query(query);
    console.log(results.rows);
    const dataAvailable = results.rows.length > 0;
    const leaveApplications = results.rows.map((leaveItem) => {
      const leaveApplication = new LeaveApplicationModel(leaveItem);
      console.log("item", leaveApplication);
      return leaveApplication;
    });

    return [dataAvailable, leaveApplications];
  } catch (error) {
    throw new Error(
      `crud.getLeaveApplicationsByDepartment error: ${error.message}`
    );
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
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
  registerEmployee,
  updatePasswordFirstTime,
  updateStatusToOffline,
  updateStatusToOnline,
};
