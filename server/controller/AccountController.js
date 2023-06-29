const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../app_config/db.js");
const Employee = require("../model/EmployeeModel.js");
const queries = require("../queries/queries.js");

const secretKey = process.env.JWT_SECRET;

const registerNewEmployee = async (request, response) => {
  try {
    const employee = new Employee(request.body);
    const emailExistsQuery = {
      text: queries.getEmployeeByEmail,
      values: [employee.cleanEmail],
    };
    const emailExistsResult = await pool.query(emailExistsQuery);

    if (emailExistsResult.rows.length > 0) {
      return response
        .status(409)
        .json({ message: "Email is already registered." });
    } else {
      const registerEmployeeQuery = {
        text: queries.registerNewEmployee,
        values: [
          employee.departmentId,
          employee.employeeRole,
          employee.firstName,
          employee.lastName,
          employee.gender,
          employee.email,
          employee.nric,
          await employee.encryptPassword(),
        ],
      };
      await pool.query(registerEmployeeQuery);

      return response
        .status(201)
        .json({ message: "Account successfully registered." });
    }
  } catch (error) {
    console.error(error);

    let statusCode;
    let message;

    switch (error.code) {
      case "23502":
        statusCode = 400;
        message = "Null value error.";
        break;
      case "23503":
        statusCode = 400;
        message = "Invalid department ID.";
        break;
      case "23505":
        statusCode = 400;
        message = "Email is already registered.";
        break;
      default:
        statusCode = 500;
        message = `${error.message}`;
        break;
    }

    return response.status(statusCode).json({ message });
  }
};

const loginAccount = async (request, response) => {
  const { email, password } = request.body;

  pool.query(queries.getEmployeeByEmail, [email], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    }
    // If email does not exist in database
    else if (results.rows.length === 0) {
      return response
        .status(400)
        .json({ message: "Email does not exist. Please contact admin." });
    }
    // If email exists in database
    else {
      const hashedPassword = results.rows[0].hash_password;
      bcrypt.compare(password, hashedPassword, (error, isMatching) => {
        if (error) {
          console.error(error);
          return response
            .status(500)
            .json({ message: "Internal server error" });
        }
        // If password is valid
        else if (isMatching) {
          const token = jwt.sign({ email: email }, secretKey, {
            expiresIn: "15m",
          });
          return response
            .status(200)
            .json({ message: "Login successful.", token: token });
        }
        // If password is invalid
        else {
          return response.status(401).json({ message: "Password is invalid." });
        }
      });
    }
  });
};

module.exports = {
  registerNewEmployee,
  loginAccount,
};
