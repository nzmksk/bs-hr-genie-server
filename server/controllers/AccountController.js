const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const queries = require("../utils/queries/queries.js");
const tokens = require("../utils/tokens/tokens.js");
const { pool, redis } = require("../config/config.js");
const { EmployeeModel } = require("../models/models.js");

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

        return response
          .status(200)
          .json({ message: "Authentication successful.", token: accessToken });
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

module.exports = { loginAccount, renewRefreshToken };
