const bcrypt = require("bcrypt");
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
        .status(400)
        .json({ error: "Email does not exist. Please contact admin." });
    }
  } catch (error) {
    return response.status(500).json({ message: `${error.message}` });
  }
};

module.exports = { loginAccount };
