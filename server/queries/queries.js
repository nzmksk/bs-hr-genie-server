// DEPARTMENT
const createNewDepartment = `INSERT INTO department (department_id, department_name)
VALUES ($1, $2)
RETURNING *`;
const deleteDepartment = `DELETE FROM department
WHERE department_id = $1
RETURNING *`;
const deleteEmployeeInDepartment = `DELETE FROM employee
WHERE department_id = $1`;
const getDepartmentByID = "SELECT * FROM department WHERE department_id = $1";
const getDepartmentByName =
  "SELECT * FROM department WHERE department_name = $1";
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
const getEmployeeByID = "SELECT * FROM employee WHERE employee_id = $1";
const registerNewEmployee = `INSERT INTO employee (department_id, employee_role, first_name, last_name, gender, email, nric, hash_password)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *`;
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

// LEAVE
const getLeaveApplications = "SELECT * FROM leave";
const getLeaveApplicationsByDepartment = `SELECT * FROM leave
WHERE leave_id LIKE '%' || $1 || '%'`;

module.exports = {
  // Department
  createNewDepartment,
  deleteDepartment,
  deleteEmployeeInDepartment,
  getDepartmentByID,
  getDepartmentByName,
  getDepartments,
  updateDepartment,
  updateEmployeeDepartment,
  // Employee
  deleteEmployee,
  getEmployees,
  getEmployeeByEmail,
  getEmployeeByID,
  registerNewEmployee,
  updateEmployeeDetails,
  // Leave
  getLeaveApplications,
  getLeaveApplicationsByDepartment,
};
