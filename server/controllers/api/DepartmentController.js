const psqlQuery = require("../../services/psql/queries.js");
const pool = require("../../config/db.js");

const createDepartment = (request, response) => {
  const { department_id, department_name } = request.body;
  if (department_id.length < 2 || department_id.length > 3) {
    return response
      .status(400)
      .json({ message: "Department ID must be 2-3 characters." });
  } else {
    pool.query(
      psqlQuery.getDepartmentById,
      [department_id.toUpperCase()],
      (error, results) => {
        if (error) {
          console.error(`Find department by ID error: ${error}`);
          console.error(error);
          return response
            .status(500)
            .json({ message: "Internal server error." });
        }
        // If department already exists
        else if (results.rows.length > 0) {
          const department = results.rows[0];
          return response
            .status(409)
            .json({ data: department, message: "Department already exists." });
        }
        // If department does not exist
        else {
          pool.query(
            psqlQuery.createDepartment,
            [department_id.toUpperCase(), department_name],
            (error, results) => {
              if (error) {
                console.error(`Create department error: ${error}`);
                if (error.code === "23505") {
                  pool.query(
                    psqlQuery.getDepartmentByName,
                    [department_name],
                    (error, results) => {
                      if (error) {
                        console.error(error);
                        return response
                          .status(500)
                          .json({ message: "Internal server error." });
                      } else {
                        let department = results.rows[0];
                        return response.status(409).json({
                          data: department,
                          message: "Department already exists.",
                        });
                      }
                    }
                  );
                } else {
                  return response
                    .status(500)
                    .json({ message: "Internal server error." });
                }
              } else {
                let department = results.rows[0];
                return response.status(201).json({
                  data: department,
                  message: "Department has been successfully created.",
                });
              }
            }
          );
        }
      }
    );
  }
};

const getDepartments = (request, response) => {
  pool.query(psqlQuery.getDepartments, (error, results) => {
    if (error) {
      console.error(`Get department error: ${error}`);
      return response.status(500).json({ message: "Internal server error." });
    }
    // If data is available
    else if (results.rows.length > 0) {
      const departments = results.rows;
      return response.status(200).json({ data: departments });
    }
    // If data is not available
    else {
      return response
        .status(404)
        .json({ data: [], message: "No data available." });
    }
  });
};

const getDepartmentByID = (request, response) => {
  const departmentID = request.params.id.toUpperCase();
  pool.query(psqlQuery.getDepartmentByID, [departmentID], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    }
    // If data is available
    else if (results.rows.length > 0) {
      const department = results.rows[0];
      return response.status(200).json({ data: department });
    }
    // If data is not available
    else {
      return response
        .status(404)
        .json({ data: [], message: "No data available." });
    }
  });
};

const updateDepartment = (request, response) => {
  const oldDepartmentID = request.params.id;
  const { department_id: newDepartmentID, department_name } = request.body;
  try {
    let department;
    pool.query("BEGIN");
    pool.query(
      psqlQuery.updateDepartment,
      [
        newDepartmentID.toUpperCase(),
        department_name,
        oldDepartmentID.toUpperCase(),
      ],
      (error, results) => {
        department = results.rows[0];
      }
    );
    pool.query(psqlQuery.updateEmployeeDepartment, [
      newDepartmentID.toUpperCase(),
      oldDepartmentID.toUpperCase(),
    ]);
    pool.query("COMMIT");
    return response
      .status(200)
      .json({ data: department, message: "Data updated successfully." });
  } catch (error) {
    console.error(error);
    pool.query("ROLLBACK");
    return response.status(500).json({ message: "Internal server error." });
  }
};

const deleteDepartment = (request, response) => {
  const department_id = request.params.id;
  try {
    let department;
    pool.query("BEGIN");
    pool.query(psqlQuery.deleteEmployeeInDepartment, [
      department_id.toUpperCase(),
    ]);
    pool.query(
      psqlQuery.deleteDepartment,
      [department_id.toUpperCase()],
      (error, results) => {
        department = results.rows[0];
      }
    );
    pool.query("COMMIT");
    return response
      .status(200)
      .json({ data: department, message: "Data deleted successfully." });
  } catch (error) {
    console.error(error);
    pool.query("ROLLBACK");
    return response.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentByID,
  updateDepartment,
  deleteDepartment,
};
