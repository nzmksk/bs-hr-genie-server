const Router = require("express");
const { employeeController } = require("../controllers/controllers.js");

const router = Router();

router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeByID);
router.put("/:id", employeeController.updateEmployeeDetails);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
