const findEmployeeByEmail = "SELECT * FROM employee WHERE email = $1";
const registerNewEmployee = `INSERT INTO employee (department_id, employee_role, first_name, last_name, gender, email, nric, hash_password)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *`;

const findDepartmentByID = "SELECT * FROM department WHERE department_id = $1";
const findDepartmentByName =
  "SELECT * FROM department WHERE department_name = $1";
const getDepartments = "SELECT * FROM department";
const createNewDepartment = `INSERT INTO department (department_id, department_name)
VALUES ($1, $2)
RETURNING *`;

module.exports = {
  findEmployeeByEmail,
  registerNewEmployee,
  findDepartmentByID,
  findDepartmentByName,
  getDepartments,
  createNewDepartment,
};
