const Router = require("express");
const departmentController = require("../controller/DepartmentController.js");

const router = Router();

router.get("/", departmentController.getDepartments);
router.post("/create", departmentController.createNewDepartment);

module.exports = router;
