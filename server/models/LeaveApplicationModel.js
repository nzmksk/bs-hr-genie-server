const { eachDayOfInterval, isWeekend, parseISO } = require("date-fns");

class LeaveApplicationModel {
  constructor({
    leave_id,
    employee_id,
    first_name,
    last_name,
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
    this.firstName = first_name;
    this.lastName = last_name;
    this.leaveTypeId = leave_type_id;
    this.startDate = start_date;
    this.endDate = end_date;
    this.duration = duration;
    this.durationLength = duration_length ?? this.calculateDuration();
    this.reason = reason;
    this.attachment = attachment;
    this.applicationStatus = application_status;
    this.createdAt = created_at;
    this.approvedRejectedBy = approved_rejected_by;
    this.rejectReason = reject_reason;
  }

  #getWorkingDays(startDate, endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const daysCount = eachDayOfInterval({ start: start, end: end });
    console.log("count", daysCount);
    const workingDays = daysCount.filter((day) => !isWeekend(day));
    return workingDays.length;
  }

  calculateDuration() {
    this.durationLength = this.#getWorkingDays(this.startDate, this.endDate);
    return this.durationLength;
  }
}

module.exports = LeaveApplicationModel;
