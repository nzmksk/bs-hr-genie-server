class GeneralLeaveQuotaModel {
  constructor({ leave_type_name, quota }) {
    this.leaveType = leave_type_name;
    this.quota = quota;
  }
}

module.exports = GeneralLeaveQuotaModel;
