const calculateLeaveQuota = require("../utils/automations/calculateLeaveQuota.js");
const calculateTenure = require("../utils/automations/calculateTenure.js");

class AnnualLeaveQuotaModel {
  constructor(employee) {
    this.leaveTypeId = 1;

    const tenure = calculateTenure(employee.joinedDate);
    const quota = calculateLeaveQuota(
      this.leaveTypeId,
      employee.employeeRole,
      tenure
    );

    this.employeeId = employee.employeeId;
    this.quota = quota;
  }
}

module.exports = AnnualLeaveQuotaModel;
