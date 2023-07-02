const jwt = require("jsonwebtoken");
const queries = require("../utils/queries/queries.js");
const { pool, redis } = require("../config/config.js");
const {
  AnnualLeaveQuotaModel,
  EmergencyLeaveQuotaModel,
  EmployeeModel,
  MedicalLeaveQuotaModel,
  ParentalLeaveQuotaModel,
  UnpaidLeaveQuotaModel,
} = require("../models/models.js");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require("../utils/tokens/tokens.js");
const { makeTransaction } = require("../utils/transactions.js/transactions.js");
const {
  checkIfEmailExists,
  checkIfNricExists,
} = require("../utils/validations/validations.js");

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

const renewRefreshToken = async (request, response) => {
  const currentRefreshToken = request.cookies.hrgenie;
  if (!currentRefreshToken) {
    return response.status(401).json({ error: "Authentication failed." });
  }

  let payload;

  try {
    payload = jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return response.status(401).json({ error: "Authentication failed." });
  }

  const employeeExistsQuery = {
    text: queries.getEmployeeById,
    values: [payload.employeeId],
  };
  const employeeExistsResult = await pool.query(employeeExistsQuery);

  if (employeeExistsResult.rows.length === 0) {
    return response.status(404).json({ error: "User not found." });
  }

  const refreshToken = await redis.get(`${payload.employeeId}:RT`);

  if (refreshToken !== currentRefreshToken) {
    return response.status(401).json({ error: "Authentication failed." });
  } else {
    const newAccessToken = createAccessToken({ payload });
    const newRefreshToken = createRefreshToken({ payload });

    // Save refresh token on client side
    sendRefreshToken(response, newRefreshToken);

    // Save refresh token on Redis
    await redis.set(`${payload.employeeId}:RT`, newRefreshToken);

    return response
      .status(200)
      .json({ message: "Authentication successful.", token: newAccessToken });
  }
};

const registerNewEmployee = async (request, response) => {
  try {
    const employee = new EmployeeModel(request.body);
    const annualLeave = new AnnualLeaveQuotaModel(employee);
    const medicalLeave = new MedicalLeaveQuotaModel(employee);
    const parentalLeave = new ParentalLeaveQuotaModel(employee);
    const emergencyLeave = new EmergencyLeaveQuotaModel(employee);
    const unpaidLeave = new UnpaidLeaveQuotaModel(employee);

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
        registerEmployeeQuery,
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

module.exports = {
  logoutAccount,
  renewRefreshToken,
  registerNewEmployee,
};
