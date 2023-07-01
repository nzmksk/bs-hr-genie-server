const calculateParentalLeaveQuota = (employee) => {
  let leaveQuota = 0;

  if (employee.isMarried) {
    // 7 days for paternity leave, 98 days for maternity leave
    leaveQuota = employee.gender === "male" ? 7 : 98;
  }

  return leaveQuota;
};

module.exports = calculateParentalLeaveQuota;
