const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../app_config/db.js");
const queries = require("../queries/queries.js");

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET;

const registerAdmin = async (request, response) => {
  const {
    department_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    nric,
  } = request.body;

  const hashedPassword = await bcrypt.hash(nric, saltRounds);
  pool.query(queries.findEmployeeByEmail, [email], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    }
    if (results.rows.length > 0) {
      response.status(409).json({ message: "Email is already registered." });
    } else {
      pool.query(
        queries.registerAdmin,
        [
          department_id,
          employee_role,
          first_name,
          last_name,
          gender,
          email,
          nric,
          hashedPassword,
        ],
        (error, results) => {
          if (error) {
            console.error(error);
            if (error.code === "23502") {
              return response
                .status(400)
                .json({ message: "Null value error." });
            }
            if (error.code === "23503" && error.constraint.includes("fkey")) {
              return response
                .status(400)
                .json({ message: "Invalid department ID." });
            }
            return response
              .status(500)
              .json({ message: "Internal server error." });
          }
          response.status(201).json({
            message: "Account successfully registered.",
          });
        }
      );
    }
  });
};

const loginAdmin = async (request, response) => {
  const { email, password } = request.body;

  pool.query(queries.findEmployeeByEmail, [email], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    }
    if (results.rows.length === 0) {
      response
        .status(400)
        .json({ message: "Email does not exist. Please contact admin." });
    } else {
      const hashedPassword = results.rows[0].hash_password;
      bcrypt.compare(password, hashedPassword, (error, isMatching) => {
        if (error) {
          console.error(error);
          return response
            .status(500)
            .json({ message: "Internal server error" });
        }
        if (isMatching) {
          const token = jwt.sign({ email: email }, secretKey, {
            expiresIn: "15m",
          });
          return response
            .status(200)
            .json({ message: "Login successful.", token: token });
        } else {
          return response.status(401).json({ message: "Password is invalid." });
        }
      });
    }
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
