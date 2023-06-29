const bcrypt = require("bcrypt");
const pool = require("../app_config/db.js");
const EmployeeModel = require("../model/EmployeeModel.js");
const queries = require("../queries/queries.js");
const tokens = require("../middleware/authentication/tokens.js");

const registerNewEmployee = async (request, response) => {
  try {
    const employee = new EmployeeModel(request.body);
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
  try {
    const accountExistsQuery = {
      text: queries.getEmployeeByEmail,
      values: [email],
    };
    const accountExistsResult = await pool.query(accountExistsQuery);

    if (accountExistsResult.rows.length > 0) {
      const employee = new EmployeeModel(accountExistsResult.rows[0]);
      const isValidPassword = await bcrypt.compare(
        password,
        employee.hashedPassword
      );

      if (isValidPassword) {
        const accessToken = tokens.createAccessToken(employee.email);
        const refreshToken = tokens.createRefreshToken(employee.email);
        const updateEmployeeRefreshTokenQuery = {
          text: queries.updateEmployeeRefreshToken,
          values: [refreshToken, email],
        };
        await pool.query(updateEmployeeRefreshTokenQuery);

        tokens.sendRefreshToken(response, refreshToken);
        return response
          .status(200)
          .json({ message: "Login successful.", token: accessToken });
      } else {
        return response.status(401).json({ message: "Password is invalid." });
      }
    } else {
      return response
        .status(400)
        .json({ message: "Email does not exist. Please contact admin." });
    }
  } catch (error) {
    return response.status(500).json({ message: `${error.message}` });
  }
};

module.exports = {
  registerNewEmployee,
  loginAccount,
};
