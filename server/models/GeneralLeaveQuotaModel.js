class GeneralLeaveQuotaModel {
  constructor({ leave_type_name, quota, used_leave }) {
    this.leaveType = leave_type_name;
    this.quota = quota;
    this.usedLeave = used_leave;
  }
}

module.exports = GeneralLeaveQuotaModel;
