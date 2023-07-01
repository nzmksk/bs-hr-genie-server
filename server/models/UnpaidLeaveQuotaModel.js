class UnpaidLeaveQuotaModel {
  constructor(employee) {
    this.leaveTypeId = 5;
    this.employeeId = employee.employeeId;
    this.quota = 60;
  }
}

module.exports = UnpaidLeaveQuotaModel;
