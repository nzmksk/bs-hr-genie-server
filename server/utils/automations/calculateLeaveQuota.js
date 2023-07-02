const calculateLeaveQuota = (leaveTypeId, role, tenure) => {
  let leaveQuota;

  switch (leaveTypeId) {
    // Annual leave allocation
    case 1:
      switch (role) {
        case "manager":
          switch (tenure) {
            // Tenure < 2 years
            case 0:
            case 1:
              leaveQuota = 12;
              break;

            // Tenure 2-5 years
            case 2:
            case 3:
            case 4:
              leaveQuota = 16;
              break;

            // Tenure 5+ years
            default:
              leaveQuota = 20;
              break;
          }
          break;

        case "admin":
        case "employee":
          switch (tenure) {
            // Tenure < 2 years
            case 0:
            case 1:
              leaveQuota = 8;
              break;

            // Tenure 2-5 years
            case 2:
            case 3:
            case 4:
              leaveQuota = 12;
              break;

            // Tenure 5+ years
            default:
              leaveQuota = 16;
              break;
          }

        default:
          break;
      }
      break;

    // Medical leave allocation
    case 2:
      switch (role) {
        case "manager":
          switch (tenure) {
            // Tenure < 2 years
            case 0:
            case 1:
              leaveQuota = 16;
              break;

            // Tenure 2-5 years
            case 2:
            case 3:
            case 4:
              leaveQuota = 18;
              break;

            // Tenure 5+ years
            default:
              leaveQuota = 22;
              break;
          }
          break;

        case "admin":
        case "employee":
          switch (tenure) {
            // Tenure < 2 years
            case 0:
            case 1:
              leaveQuota = 14;
              break;

            // Tenure 2-5 years
            case 2:
            case 3:
            case 4:
              leaveQuota = 16;
              break;

            // Tenure 5+ years
            default:
              leaveQuota = 18;
              break;
          }

        default:
          break;
      }

    default:
      break;
  }

  return leaveQuota;
};

module.exports = calculateLeaveQuota;
