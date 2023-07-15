const pool = require("../../config/db.js");
const models  = require("../../models/models.js");
const psqlCrud = require("../../services/psql/crud.js");
const psqlQuery = require("../../services/psql/queries.js");
const psqlValidate = require("../../services/psql/validations.js");

const getEmployees = (request, response) => {
  pool.query(psqlQuery.getEmployees, (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    } else {
      let employees = results.rows;
      return response.status(200).json({ data: employees });
    }
  });
};

const getEmployeeById = (request, response) => {
  const employeeId = request.params.id;
  pool.query(
    psqlQuery.getEmployeeById,
    [employeeId.toUpperCase()],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else {
        let employee = results.rows[0];
        return response.status(200).json({ data: employee });
      }
    }
  );
};

const registerNewEmployee = async (request, response) => {
  let employee = new models.EmployeeModel(request.body);

  try {
    const isEmailExists = await psqlValidate.checkIfEmailExists(employee.email);
    if (isEmailExists) {
      return response
        .status(409)
        .json({ error: "Email is already registered." });
    }

    const isNricExists = await psqlValidate.checkIfNricExists(employee.nric);
    if (isNricExists) {
      return response
        .status(409)
        .json({ error: "NRIC is already registered." });
    }

    const newEmployee = await psqlCrud.registerEmployee(employee);

    const annualLeave = new models.AnnualLeaveQuotaModel(newEmployee);
    const medicalLeave = new models.MedicalLeaveQuotaModel(newEmployee);
    const parentalLeave = new models.ParentalLeaveQuotaModel(newEmployee);
    const emergencyLeave = new models.EmergencyLeaveQuotaModel(newEmployee);
    const unpaidLeave = new models.UnpaidLeaveQuotaModel(newEmployee);

    await psqlCrud.allocateLeaves(
      annualLeave,
      medicalLeave,
      parentalLeave,
      emergencyLeave,
      unpaidLeave
    );

    return response
      .status(201)
      .json({ message: "Account successfully registered." });
  } catch (error) {
    console.error(`registerNewEmployee error: ${error.message}`);
    return response.status(500).json({ error: "Internal server error." });
  }
};

const updateEmployeeDetails = (request, response) => {
  const employee_id = request.params.id;
  const {
    department_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    phone,
    nric,
    is_probation,
    is_married,
    joined_date,
  } = request.body;
  pool.query(
    psqlQuery.updateEmployeeDetails,
    [
      department_id,
      employee_role,
      first_name,
      last_name,
      gender,
      email,
      phone,
      nric,
      is_probation,
      is_married,
      joined_date,
      employee_id,
    ],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else {
        let employee = results.rows[0];
        return response
          .status(200)
          .json({ data: employee, message: "Data updated successfully." });
      }
    }
  );
};

const deleteEmployee = (request, response) => {
  const employeeID = request.params.id;
  try {
    let employee;
    pool.query("BEGIN");
    pool.query(
      psqlQuery.deleteEmployee,
      [employeeID.toUpperCase()],
      (error, results) => {
        employee = results.rows[0];
      }
    );
    pool.query("COMMIT");
    return response
      .status(200)
      .json({ data: employee, message: "Data deleted successfully." });
  } catch (error) {
    console.error(error);
    pool.query("ROLLBACK");
    return response.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  registerNewEmployee,
  updateEmployeeDetails,
  deleteEmployee,
};
