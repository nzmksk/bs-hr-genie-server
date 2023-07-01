const calculateParentalLeaveQuota = require("../utils/automations/calculateParentalLeaveQuota.js");

class ParentalLeaveQuotaModel {
  constructor(employee) {
    const quota = calculateParentalLeaveQuota(employee);

    this.leaveTypeId = 3;
    this.employeeId = employee.employeeId;
    this.quota = quota;
  }
}

module.exports = ParentalLeaveQuotaModel;
