const bcrypt = require("bcrypt");

const psqlCrud = require("../../services/psql/crud.js");
const psqlValidate = require("../../services/psql/validations.js");
const redisQuery = require("../../services/redis/redisQueries.js");

const adminLogin = async (request, response) => {
  let error;
  const { email, password } = request.body;

  // TODO: Implement CSRF token

  try {
    const [accountExists, account] = await psqlValidate.checkIfEmailExists(
      email
    );

    if (accountExists) {
      const employee = account;
      switch (employee.employeeRole) {
        case "employee":
        case "manager":
        case "resigned":
          error = "Access denied.";
          return response.status(401).render("login.njk", {
            error,
          });

        case "superadmin":
        case "admin":
        default:
          break;
      }

      const isValidPassword = await bcrypt.compare(
        password,
        employee.hashedPassword
      );

      // TODO: Update this function for SSR implementation
      if (isValidPassword) {
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
        error = "Invalid password";
        return response.status(401).render("login.njk", { error });
      }
    } else {
      error = "Email does not exist. Please contact admin.";
      return response.status(404).render("login.njk", { error });
    }
  } catch (error) {
    console.error(`loginAccount error: ${error.message}`);
    error = "Internal server error.";
    return response.status(500).render("login.njk", { error });
  }
};

module.exports = { adminLogin };
