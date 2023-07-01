const calculateParentalLeaveQuota = require("../utils/automations/calculateParentalLeaveQuota.js");

class ParentalLeaveQuotaModel {
  constructor(employee) {
    const quota = calculateParentalLeaveQuota(employee);

    this.leave_type_id = 3;
    this.employee_id = employee.employeeId;
    this.quota = quota;
  }
}

module.exports = ParentalLeaveQuotaModel;
