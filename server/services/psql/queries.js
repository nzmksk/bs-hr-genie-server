// DEPARTMENT
const createDepartment = `INSERT INTO department (
    department_id,
    department_name
)
VALUES ($1, $2)
RETURNING *`;
const deleteDepartment = `DELETE FROM department
WHERE department_id = $1
RETURNING *`;
const deleteEmployeeInDepartment = `DELETE FROM employee
WHERE department_id = $1`;
const getDepartmentById = "SELECT * FROM department WHERE department_id = $1";
const getDepartmentByName = `SELECT * FROM department
WHERE department_name = $1`;
const getDepartments = "SELECT * FROM department";
const updateDepartment = `UPDATE department
SET department_id = $1,
    department_name = $2
WHERE department_id = $3
RETURNING *`;
const updateEmployeeDepartment = `UPDATE employee
SET department_id = CASE
    WHEN department_id = $2 THEN $1
    ELSE employee.department_id
    END`;

// EMPLOYEE
const deleteEmployee = `DELETE FROM employee
WHERE employee_id = $1
RETURNING *`;
const getEmployees = "SELECT * FROM employee";
const getEmployeeByEmail = "SELECT * FROM employee WHERE email = $1";
const getEmployeeById = "SELECT * FROM employee WHERE employee_id = $1";
const getEmployeeByNric = "SELECT * FROM employee WHERE nric = $1";
const registerNewEmployee = `INSERT INTO employee (
    department_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    position,
    phone,
    nric,
    is_married,
    joined_date,
    hashed_password
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *`;
const revokeAccessToken = `INSERT INTO revoked_token (
    employee_id,
    token,
    expiration_time
)
VALUES ($1, $2, $3)`;
const updateEmployeeDetails = `UPDATE employee
SET department_id = $1,
    employee_role = $2,
    first_name = $3,
    last_name = $4,
    gender = $5,
    email = $6,
    phone = $7,
    nric = $8,
    is_probation = $9,
    is_married = $10,
    joined_date = $11
WHERE employee_id = $12
RETURNING *`;
const updateEmployeeRefreshToken = `UPDATE employee
SET refresh_token = $1
WHERE email = $2`;
const updatePasswordFirstTime = `UPDATE employee
SET hashed_password = $1,
    password_updated = TRUE,
    is_logged_in = FALSE
WHERE employee_id = $2`;
const updateStatusToOffline = `UPDATE employee
SET is_logged_in = FALSE
WHERE employee_id = $1`;
const updateStatusToOnline = `UPDATE employee
SET is_logged_in = TRUE,
    last_login = CURRENT_TIMESTAMP
WHERE employee_id = $1`;

// LEAVE
const allocateLeave = `INSERT INTO leave_quota (
    employee_id,
    leave_type_id,
    quota
)
VALUES ($1, $2, $3),
    ($1, $4, $5),
    ($1, $6, $7),
    ($1, $8, $9),
    ($1, $10, $11)`;
const applyLeave = `INSERT INTO leave (
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    duration_length,
    reason,
    attachment
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *`;
const approveRejectLeave = `UPDATE leave
SET application_status = $1,
    approved_rejected_by = $2,
    reject_reason = $3
WHERE leave_id = $4
RETURNING *`;
const cancelApplication = `UPDATE leave
SET application_status = $1
WHERE leave_id = $2`;
const deleteLeaveApplication = `DELETE FROM leave
WHERE leave_id = $1
RETURNING *`;
const getLeaveApplications = `SELECT e.first_name,
    e.last_name,
    l.*
FROM leave AS l
JOIN employee AS e
ON l.employee_id = e.employee_id
WHERE l.employee_id = $1
ORDER BY l.application_status ASC,
    l.created_at DESC`;
const getLeaveApplicationsByDate = `SELECT * FROM leave
WHERE employee_id = $1
AND start_date <= $2
AND end_date >= $3
AND application_status IN ('pending', 'approved')`;
const getLeaveApplicationsByDepartment = `SELECT e.first_name,
    e.last_name,
    l.*
FROM leave AS l
JOIN employee AS e
ON l.employee_id = e.employee_id
WHERE l.leave_id LIKE $1 || '%'
AND l.employee_id != $2
ORDER BY l.application_status ASC,
    l.created_at DESC`;
const getLeaveCount = `SELECT lc.leave_type_name, lq.quota, lq.used_leave
FROM leave_category AS lc
JOIN leave_quota AS lq
ON lq.leave_type_id = lc.leave_type_id
WHERE lq.employee_id = $1
ORDER BY lq.leave_type_id ASC`;
const getLeaveQuota = `SELECT quota FROM leave_quota
WHERE leave_type_id = $1
AND employee_id = $2`;
const updateLeaveQuotaApproved = `UPDATE leave_quota
SET quota = quota - $1,
used_leave = used_leave + $1
WHERE employee_id = $2
AND leave_type_id = $3`;
const updateLeaveQuotaCancelled = `UPDATE leave_quota
SET quota = quota + $1,
used_leave = used_leave - 1
WHERE employee_id = $2
AND leave_type_id = $3`;

module.exports = {
  // Department
  createDepartment,
  deleteDepartment,
  deleteEmployeeInDepartment,
  getDepartmentById,
  getDepartmentByName,
  getDepartments,
  updateDepartment,
  updateEmployeeDepartment,

  // Employee
  deleteEmployee,
  getEmployees,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByNric,
  registerNewEmployee,
  revokeAccessToken,
  updateEmployeeDetails,
  updateEmployeeRefreshToken,
  updatePasswordFirstTime,
  updateStatusToOffline,
  updateStatusToOnline,

  // Leave
  allocateLeave,
  applyLeave,
  approveRejectLeave,
  cancelApplication,
  deleteLeaveApplication,
  getLeaveApplications,
  getLeaveApplicationsByDate,
  getLeaveApplicationsByDepartment,
  getLeaveCount,
  getLeaveQuota,
  updateLeaveQuotaApproved,
  updateLeaveQuotaCancelled,
};
