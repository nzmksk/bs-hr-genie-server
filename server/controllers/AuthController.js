const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db.js");
const models = require("../models/models.js");
const psqlCrud = require("../services/psql/crud.js");
const psqlQuery = require("../services/psql/queries.js");
const psqlValidate = require("../services/psql/validations.js");
const redisQuery = require("../services/redis/redisQueries.js");
const tokens = require("../utils/tokens/tokens.js");

const firstTimeLogin = async (request, response) => {
  const { password: plainPassword } = request.body;
  try {
    const accountExistsQuery = {
      text: psqlQuery.getEmployeeById,
      values: [request.employeeId],
    };
    const accountExistsResult = await pool.query(accountExistsQuery);

    // Check if account exists
    if (accountExistsResult.rows.length > 0) {
      const employee = new models.EmployeeModel(accountExistsResult.rows[0]);
      await employee.encryptPassword(plainPassword);

      // Update password
      const query = {
        text: psqlQuery.changePassword,
        values: [employee.hashedPassword, employee.employeeId],
      };
      await pool.query(query);
      await psqlCrud.updateStatusToOffline(request.employeeId);

      // Blacklist previous session token that may still active
      const activeToken = await redisQuery.getActiveToken(employee.employeeId);
      const decodedToken = jwt.decode(activeToken);
      const tokenExpiration = decodedToken.exp;
      await redisQuery.blacklistToken(
        employee.employeeId,
        activeToken,
        tokenExpiration
      );

      // Clear refresh token on the client side
      response.clearCookie("hrgenie", { path: "/refresh_token" });

      // Clear active and refresh tokens on Redis
      await redisQuery.deleteActiveToken(request.employeeId);
      await redisQuery.deleteRefreshToken(request.employeeId);

      return response.status(200).json({
        message: "Password updated. Please login with the new password.",
      });
    } else {
      return response.status(404).json({
        error: "Account does not exist.",
      });
    }
  } catch (error) {
    console.error(`firstTimeLogin error: ${error.message}`);
    return response.status(500).json({ message: "Internal server error." });
  }
};

const loginAccount = async (request, response) => {
  const { email, password } = request.body;
  try {
    const accountExistsQuery = {
      text: psqlQuery.getEmployeeByEmail,
      values: [email],
    };
    const accountExistsResult = await pool.query(accountExistsQuery);

    // Check if account exists
    if (accountExistsResult.rows.length > 0) {
      const employee = new models.EmployeeModel(accountExistsResult.rows[0]);
      const isValidPassword = await bcrypt.compare(
        password,
        employee.hashedPassword
      );

      if (isValidPassword) {
        // If user is currently online
        if (employee.isLoggedIn) {
          // Blacklist previous session token that may still active
          const activeToken = await redisQuery.getActiveToken(
            employee.employeeId
          );
          const decodedToken = jwt.decode(activeToken);
          const tokenExpiration = decodedToken.exp;
          await redisQuery.blacklistToken(
            employee.employeeId,
            activeToken,
            tokenExpiration
          );
        }

        // Update client's last login
        await psqlCrud.updateStatusToOnline(employee.employeeId);

        // Generate tokens
        const accessToken = tokens.createAccessToken(
          employee.email,
          employee.employeeId,
          employee.employeeRole
        );
        const refreshToken = tokens.createRefreshToken(
          employee.email,
          employee.employeeId,
          employee.employeeRole
        );

        // Save refresh token on client side
        tokens.sendRefreshToken(response, refreshToken);

        // Save access and refresh tokens on Redis
        await redisQuery.saveActiveToken(employee.employeeId, accessToken);
        await redisQuery.saveRefreshToken(employee.employeeId, refreshToken);

        return response.status(200).json({
          data: employee,
          message: "Authentication successful.",
          token: accessToken,
        });
      } else {
        return response.status(401).json({ error: "Invalid password." });
      }
    } else {
      return response
        .status(404)
        .json({ error: "Email does not exist. Please contact admin." });
    }
  } catch (error) {
    console.error(`loginAccount error: ${error.message}`);
    return response.status(500).json({ message: "Internal server error." });
  }
};

const logoutAccount = async (request, response) => {
  // Clear refresh token on the client side
  response.clearCookie("hrgenie", { path: "/refresh_token" });

  // Revoke current access token
  const authorization = request.headers["authorization"];
  const accessToken = authorization ? authorization.split(" ")[1] : null;

  if (accessToken) {
    try {
      const decodedToken = jwt.decode(accessToken);
      const tokenExpiration = decodedToken.exp;

      // Clear active and refresh tokens on Redis
      await redisQuery.deleteActiveToken(request.employeeId);
      await redisQuery.deleteRefreshToken(request.employeeId);

      // Blacklist access token on Redis
      await redisQuery.blacklistToken(
        request.employeeId,
        accessToken,
        tokenExpiration
      );

      await psqlCrud.updateStatusToOffline(request.employeeId);

      return response
        .status(200)
        .json({ message: "Token revoked successfully." });
    } catch (error) {
      console.error(`logoutAccount error: ${error.message}`);
      return response.status(500).json({ error: "Internal server error" });
    }
  }
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

const renewRefreshToken = async (request, response) => {
  const currentRefreshToken = request.cookies.hrgenie;
  if (!currentRefreshToken) {
    return response.status(401).json({ error: "Authentication failed." });
  }

  let payload;

  try {
    payload = jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check is account exists
    const isAccountExists = await psqlValidate.checkIfEmailExists(
      payload.email
    );
    if (!isAccountExists) {
      return response.status(404).json({ error: "User not found." });
    }

    const refreshToken = await redisQuery.getRefreshToken(payload.employeeId);
    if (refreshToken !== currentRefreshToken) {
      return response.status(401).json({ error: "Authentication failed." });
    }

    // Generate tokens
    const newAccessToken = tokens.createAccessToken(
      payload.email,
      payload.employeeId,
      payload.employeeRole
    );
    const newRefreshToken = tokens.createRefreshToken(
      payload.email,
      payload.employeeId,
      payload.employeeRole
    );

    // Save refresh token on client side
    tokens.sendRefreshToken(response, newRefreshToken);

    // Save access and refresh tokens on Redis
    await redisQuery.saveActiveToken(payload.employeeId, newAccessToken);
    await redisQuery.saveRefreshToken(payload.employeeId, newRefreshToken);

    return response.status(200).json({
      message: "Token successfully refreshed.",
      token: newAccessToken,
    });
  } catch (error) {
    if (error instanceof jwt.NotBeforeError) {
      return response
        .status(403)
        .json({ error: "Refresh token failed. Access token is still valid." });
    } else {
      console.error(`renewRefreshToken error: ${error.message}`);
      return response.status(401).json({ error: "Authentication failed." });
    }
  }
};

module.exports = {
  firstTimeLogin,
  loginAccount,
  logoutAccount,
  registerNewEmployee,
  renewRefreshToken,
};
