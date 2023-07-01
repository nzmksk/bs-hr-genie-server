const calculateLeaveQuota = require("../utils/automations/calculateLeaveQuota.js");
const calculateTenure = require("../utils/automations/calculateTenure.js");

class AnnualLeaveQuotaModel {
  constructor(employee) {
    this.leave_type_id = 1;

    const tenure = calculateTenure(employee.joinedDate);
    const quota = calculateLeaveQuota(
      this.leave_type_id,
      employee.employeeRole,
      tenure
    );

    this.employee_id = employee.employeeId;
    this.quota = quota;
  }
}

module.exports = AnnualLeaveQuotaModel;
