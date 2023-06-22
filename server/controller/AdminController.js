const bcrypt = require("bcrypt");
const pool = require("../db.js");
const queries = require("../queries/queries.js");

const registerAdmin = async (req, res) => {
  let {
    department_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    nric,
  } = req.body;

  let hashedPassword = await bcrypt.hash(nric, 10);
  pool.query(queries.findEmployeeByEmail, [email], (error, results) => {
    if (error) throw error;
    if (results.rows.length > 0) {
      res.send({ message: "Email is already registered." });
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
          if (error) throw error;
          res.status(200).json({
            message: "Account successfully registered.",
          });
        }
      );
    }
  });
};

module.exports = {
  registerAdmin,
};
