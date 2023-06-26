const Router = require("express");
const employeeController = require("../controller/EmployeeController.js");

const router = Router();

router.get("/", employeeController.getEmployees);

module.exports = router;
