const Router = require("express");
const employeeController = require("../controller/EmployeeController.js");

const router = Router();

router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeByID);

module.exports = router;
