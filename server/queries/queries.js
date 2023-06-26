// EMPLOYEE
const findEmployeeByEmail = "SELECT * FROM employee WHERE email = $1";
const getEmployees = "SELECT * FROM employee";
const getEmployeeByID = `SELECT * FROM employee
WHERE employee_id = $1`;
const registerNewEmployee = `INSERT INTO employee (department_id, employee_role, first_name, last_name, gender, email, nric, hash_password)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *`;

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

module.exports = {
  findEmployeeByEmail,
  getEmployees,
  getEmployeeByID,
  registerNewEmployee,

  createNewDepartment,
  deleteDepartment,
  deleteEmployeeInDepartment,
  getDepartmentByID,
  getDepartmentByName,
  getDepartments,
  updateDepartment,
  updateEmployeeDepartment,
};
