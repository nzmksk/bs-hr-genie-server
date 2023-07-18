const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const psqlCrud = require("../../services/psql/crud.js");
const psqlValidate = require("../../services/psql/validations.js");
const redisQuery = require("../../services/redis/redisQueries.js");
const tokens = require("../../utils/tokens/tokens.js");

const firstTimeLogin = async (request, response) => {
  const { password: plainPassword } = request.body;
  try {
    const [accountExists, account] = await psqlValidate.checkIfEmailExists(
      request.email
    );

    if (accountExists) {
      const employee = account;
      await employee.encryptPassword(plainPassword);
      await psqlCrud.updatePasswordFirstTime(
        employee.hashedPassword,
        employee.employeeId
      );
      tokens.clearCookie(response);
      await redisQuery.blacklistToken(employee.employeeId);
      await redisQuery.deleteTokens(employee.employeeId);

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
    return response.status(500).json({ error: "Internal server error." });
  }
};

const loginAccount = async (request, response) => {
  const { email, password } = request.body;
  try {
    const [accountExists, account] = await psqlValidate.checkIfEmailExists(
      email.toLowerCase()
    );

    if (accountExists) {
      const employee = account;
      const isValidPassword = await bcrypt.compare(
        password,
        employee.hashedPassword
      );

      if (isValidPassword) {
        switch (employee.employeeRole) {
          case "superadmin":
          case "admin":
            return response.status(400).json({
              error: "Please login using the admin site.",
            });

          case "resigned":
            return response.status(401).json({
              error:
                "Account is dormant. Please contact admin for further assistance.",
            });

          default:
            break;
        }

        if (employee.isLoggedIn) {
          await redisQuery.blacklistToken(employee.employeeId);
        }

        await psqlCrud.updateStatusToOnline(employee.employeeId);

        const [accessToken, refreshToken] = tokens.generateTokens(
          employee.email,
          employee.employeeId,
          employee.employeeRole
        );
        tokens.sendRefreshToken(response, refreshToken);
        await redisQuery.saveTokens(
          employee.employeeId,
          accessToken,
          refreshToken
        );

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
    return response.status(500).json({ error: "Internal server error." });
  }
};

const logoutAccount = async (request, response) => {
  const authorization = request.headers["authorization"];
  const accessToken = authorization ? authorization.split(" ")[1] : null;

  if (accessToken) {
    try {
      tokens.clearCookie(response);
      await redisQuery.blacklistToken(request.employeeId);
      await redisQuery.deleteTokens(request.employeeId);

      await psqlCrud.updateStatusToOffline(request.employeeId);

      return response
        .status(200)
        .json({ message: "Token revoked successfully." });
    } catch (error) {
      console.error(`logoutAccount error: ${error.message}`);
      return response.status(500).json({ error: "Internal server error." });
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
    payload = tokens.verifyRefreshToken(currentRefreshToken);

    const [accountExists, account] = await psqlValidate.checkIfEmailExists(
      payload.email
    );
    if (!accountExists) {
      return response.status(404).json({ error: "User not found." });
    }

    const refreshToken = await redisQuery.getRefreshToken(payload.employeeId);
    if (refreshToken !== currentRefreshToken) {
      return response.status(401).json({ error: "Authentication failed." });
    }

    const [newAccessToken, newRefreshToken] = tokens.generateTokens(
      payload.email,
      payload.employeeId,
      payload.employeeRole
    );
    tokens.sendRefreshToken(response, newRefreshToken);
    await redisQuery.saveTokens(
      payload.employeeId,
      newAccessToken,
      newRefreshToken
    );

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
  renewRefreshToken,
};
