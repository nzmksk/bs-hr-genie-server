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
    phone,
    nric,
    is_married,
    joined_date,
    hashed_password
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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

// LEAVE
const allocateLeave = `INSERT INTO leave_quota (
    employee_id,
    leave_type_id,
    quota
)
VALUES ($1, $2, $3)`;
const applyLeave = `INSERT INTO leave (
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    reason,
    attachment
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *`;
const approveRejectLeave = `UPDATE leave
SET employee_id = $1,
    leave_type_id = $2,
    start_date = $3,
    end_date = $4,
    duration = $5,
    reason = $6,
    attachment = $7,
    application_status = $8,
    approved_rejected_by = $9,
    reject_reason = $10
WHERE leave_id = $11
RETURNING *`;
const deleteLeaveApplication = `DELETE FROM leave
WHERE leave_id = $1
RETURNING *`;
const getLeaveApplications = "SELECT * FROM leave";
const getLeaveApplicationsByDepartment = `SELECT * FROM leave
WHERE leave_id LIKE '%' || $1 || '%'`;

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

  // Leave
  allocateLeave,
  applyLeave,
  approveRejectLeave,
  deleteLeaveApplication,
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
};
