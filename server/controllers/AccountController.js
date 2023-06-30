const bcrypt = require("bcrypt");
const pool = require("../config/db.js");
const queries = require("../utils/queries/queries.js");
const tokens = require("../utils/tokens/tokens.js");
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

module.exports = { loginAccount };
