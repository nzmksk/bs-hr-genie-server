class LeaveApplicationModel {
  constructor({
    leave_id,
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    duration_length,
    reason,
    attachment,
    application_status,
    created_at,
    approved_rejected_by,
    reject_reason,
  }) {
    this.leaveId = leave_id;
    this.employeeId = employee_id;
    this.leaveTypeId = leave_type_id;
    this.startDate = start_date;
    this.endDate = end_date;
    this.duration = duration;
    this.durationLength = duration_length;
    this.reason = reason;
    this.attachment = attachment;
    this.applicationStatus = application_status;
    this.createdAt = created_at;
    this.approvedRejectedBy = approved_rejected_by;
    this.rejectReason = reject_reason;
  }
}

module.exports = LeaveApplicationModel;
