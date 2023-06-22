const findEmployeeByEmail = "SELECT * FROM employee WHERE email = $1";
const registerAdmin = `INSERT INTO employee (department_id, employee_role, first_name, last_name, gender, email, nric, hash_password)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *`;

const getDepartments = "SELECT * FROM department";

module.exports = {
  findEmployeeByEmail,
  registerAdmin,
  getDepartments,
};
