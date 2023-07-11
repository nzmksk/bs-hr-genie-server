const psqlQuery = require("../queries.js");

const generateAllocateLeaveQuery = (
  annualLeave,
  medicalLeave,
  parentalLeave,
  emergencyLeave,
  unpaidLeave
) => {
  // Generate queries for leave allocation transaction
  const generateQuery = (leaveTypeObj) => {
    return {
      text: psqlQuery.allocateLeave,
      values: [
        leaveTypeObj.employeeId,
        leaveTypeObj.leaveTypeId,
        leaveTypeObj.quota,
      ],
    };
  };

  const leaveTypeObjects = [
    annualLeave,
    medicalLeave,
    parentalLeave,
    emergencyLeave,
    unpaidLeave,
  ];

  const queryObjectsArray = leaveTypeObjects.map((leaveObj) => {
    return generateQuery(leaveObj);
  });

  return queryObjectsArray;
};

module.exports = generateAllocateLeaveQuery;
