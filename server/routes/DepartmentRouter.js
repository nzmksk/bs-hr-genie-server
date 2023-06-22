const Router = require("express");
const departmentController = require("../controller/DepartmentController.js");

const router = Router();

router.get("/", departmentController.getDepartments);

module.exports = router;
