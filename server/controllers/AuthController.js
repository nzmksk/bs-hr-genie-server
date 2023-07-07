const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models/models.js");
const queries = require("../utils/queries/queries.js");
const tokens = require("../utils/tokens/tokens.js");
const { pool, redis } = require("../config/config.js");
const { makeTransaction } = require("../utils/transactions/transactions.js");
const {
  checkIfEmailExists,
  checkIfNricExists,
} = require("../utils/validations/validations.js");

const loginAccount = async (request, response) => {
  const { email, password } = request.body;
  try {
    const accountExistsQuery = {
      text: queries.getEmployeeByEmail,
      values: [email],
    };
    const accountExistsResult = await pool.query(accountExistsQuery);

    if (accountExistsResult.rows.length > 0) {
      const employee = new models.EmployeeModel(accountExistsResult.rows[0]);
      const isValidPassword = await bcrypt.compare(
        password,
        employee.hashedPassword
      );

      if (isValidPassword) {
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

        // Save refresh token on Redis
        await redis.set(`${employee.employeeId}:RT`, refreshToken);

        return response.status(200).json({
          message: "Authentication successful.",
          token: accessToken,
          data: employee,
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
    return response.status(500).json({ message: `${error.message}` });
  }
};

const logoutAccount = async (request, response) => {
  // Clear refresh token on the client side
  response.clearCookie("hrgenie", { path: "/refresh_token" });

  // Revoke access token
  const authorization = request.headers["authorization"];
  const accessToken = authorization ? authorization.split(" ")[1] : null;

  if (accessToken) {
    try {
      const decodedToken = jwt.decode(accessToken);
      const tokenExpiration = decodedToken.exp;

      // Clear refresh token on Redis
      await redis.del(`${request.employeeId}:RT`);

      // Blacklist access token on Redis
      await redis.set(
        `${request.employeeId}:AT`,
        accessToken,
        "EXAT",
        tokenExpiration
      );

      return response
        .status(200)
        .json({ message: "Token revocation successful." });
    } catch (error) {
      return response.status(500).json({ error: `${error.message}` });
    }
  }
};

const registerNewEmployee = async (request, response) => {
  let employee = new models.EmployeeModel(request.body);
  
  try {
    // Check if email exists
    const [emailStatusCode, emailErrorMessage] = await checkIfEmailExists(
      employee.email
    );
    if (emailStatusCode && emailErrorMessage) {
      return response
        .status(emailStatusCode)
        .json({ error: emailErrorMessage });
    }

    // Check if NRIC exists
    const [nricStatusCode, nricErrorMessage] = await checkIfNricExists(
      employee.nric
    );
    if (nricStatusCode && nricErrorMessage) {
      return response.status(nricStatusCode).json({ error: nricErrorMessage });
    }

    try {
      // Register new account
      const registerEmployeeQuery = {
        text: queries.registerNewEmployee,
        values: [
          employee.departmentId,
          employee.employeeRole,
          employee.firstName,
          employee.lastName,
          employee.gender,
          employee.email,
          employee.phone,
          employee.nric,
          employee.isMarried,
          employee.joinedDate,
          await employee.encryptPassword(),
        ],
      };

      const registerEmployeeResult = await pool.query(registerEmployeeQuery);
      employee = new models.EmployeeModel(registerEmployeeResult.rows[0]);
    } catch (error) {
      return response.status(500).json({ error: `${error.message}` });
    }

    const annualLeave = new models.AnnualLeaveQuotaModel(employee);
    const medicalLeave = new models.MedicalLeaveQuotaModel(employee);
    const parentalLeave = new models.ParentalLeaveQuotaModel(employee);
    const emergencyLeave = new models.EmergencyLeaveQuotaModel(employee);
    const unpaidLeave = new models.UnpaidLeaveQuotaModel(employee);
    
    // Allocate leave quota
    const allocateAnnualLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        annualLeave.employeeId,
        annualLeave.leaveTypeId,
        annualLeave.quota,
      ],
    };
    const allocateMedicalLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        medicalLeave.employeeId,
        medicalLeave.leaveTypeId,
        medicalLeave.quota,
      ],
    };
    const allocateParentalLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        parentalLeave.employeeId,
        parentalLeave.leaveTypeId,
        parentalLeave.quota,
      ],
    };
    const allocateEmergencyLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        emergencyLeave.employeeId,
        emergencyLeave.leaveTypeId,
        emergencyLeave.quota,
      ],
    };
    const allocateUnpaidLeaveQuery = {
      text: queries.allocateLeave,
      values: [
        unpaidLeave.employeeId,
        unpaidLeave.leaveTypeId,
        unpaidLeave.quota,
      ],
    };

    // Perform transaction
    const { statusCode, successMessage, errorMessage } = await makeTransaction(
      [
        allocateAnnualLeaveQuery,
        allocateMedicalLeaveQuery,
        allocateParentalLeaveQuery,
        allocateEmergencyLeaveQuery,
        allocateUnpaidLeaveQuery,
      ],
      201,
      "Account successfully registered."
    );

    return response
      .status(statusCode)
      .json({ message: successMessage, error: errorMessage });
  } catch (error) {
    return response.status(500).json({ error: `${error.message}` });
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
  } catch (error) {
    if (error instanceof jwt.NotBeforeError) {
      return response
        .status(403)
        .json({ error: "Refresh token failed. Access token is still valid." });
    } else {
      return response.status(401).json({ error: "Authentication failed." });
    }
  }

  const employeeExistsQuery = {
    text: queries.getEmployeeByEmail,
    values: [payload.email],
  };
  const employeeExistsResult = await pool.query(employeeExistsQuery);

  if (employeeExistsResult.rows.length === 0) {
    return response.status(404).json({ error: "User not found." });
  }

  const refreshToken = await redis.get(`${payload.employeeId}:RT`);

  if (refreshToken !== currentRefreshToken) {
    return response.status(401).json({ error: "Authentication failed." });
  } else {
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

    // Save refresh token on Redis
    await redis.set(`${payload.employeeId}:RT`, newRefreshToken);

    return response
      .status(200)
      .json({ message: "Authentication successful.", token: newAccessToken });
  }
};

module.exports = {
  loginAccount,
  logoutAccount,
  registerNewEmployee,
  renewRefreshToken,
};
