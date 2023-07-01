const AnnualLeaveQuotaModel = require("./AnnualLeaveQuotaModel.js");

class EmergencyLeaveQuotaModel extends AnnualLeaveQuotaModel {
  constructor(employee) {
    super(employee);
    this.leaveTypeId = 4;
  }
}

module.exports = EmergencyLeaveQuotaModel;
