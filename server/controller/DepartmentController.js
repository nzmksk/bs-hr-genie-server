const pool = require("../app_config/db.js");
const queries = require("../queries/queries.js");

const getDepartments = (request, response) => {
  pool.query(queries.getDepartments, (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ message: "Internal server error." });
    } else {
      let departments = results.rows;
      return response.status(200).json({ data: departments });
    }
  });
};

const getDepartmentByID = (request, response) => {
  const departmentID = request.params.id;
  pool.query(
    queries.getDepartmentByID,
    [departmentID.toUpperCase()],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else if (results.rows.length > 0) {
        let department = results.rows[0];
        return response.status(200).json({ data: department });
      }
    }
  );
};

const createNewDepartment = (request, response) => {
  const { department_id, department_name } = request.body;
  if (department_id.length < 2) {
    return response
      .status(400)
      .json({ message: "Department ID should be at least 2 characters." });
  } else {
    pool.query(
      queries.getDepartmentByID,
      [department_id.toUpperCase()],
      (error, results) => {
        if (error) {
          console.error(error);
          return response
            .status(500)
            .json({ message: "Internal server error." });
        }
        // If department already exists
        else if (results.rows.length > 0) {
          return response
            .status(409)
            .json({ message: "Department already exists!" });
        }
        // If department does not exist
        else {
          pool.query(
            queries.createNewDepartment,
            [department_id.toUpperCase(), department_name],
            (error, results) => {
              if (error) {
                console.error(error);
                if (error.code === "22001") {
                  return response.status(400).json({
                    message: "Department ID should be 3 characters at maximum.",
                  });
                } else if (error.code === "23505") {
                  pool.query(
                    queries.getDepartmentByName,
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
                          message: "Department name already exists!",
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
                  message: `Department ${department.department_name} has been successfully created.`,
                });
              }
            }
          );
        }
      }
    );
  }
};

const updateDepartment = (request, response) => {
  const oldDepartmentID = request.params.id;
  const { department_id: newDepartmentID, department_name } = request.body;
  try {
    let department;
    pool.query("BEGIN");
    pool.query(
      queries.updateDepartment,
      [
        newDepartmentID.toUpperCase(),
        department_name,
        oldDepartmentID.toUpperCase(),
      ],
      (error, results) => {
        department = results.rows[0];
      }
    );
    pool.query(queries.updateEmployeeDepartment, [
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
  pool.query(
    queries.deleteDepartment,
    [department_id.toUpperCase()],
    (error, results) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ message: "Internal server error." });
      } else {
        let department = results.rows[0];
        return response
          .status(200)
          .json({ data: department, message: "Data deleted successfully." });
      }
    }
  );
};

module.exports = {
  createNewDepartment,
  getDepartments,
  getDepartmentByID,
  updateDepartment,
  deleteDepartment,
};
