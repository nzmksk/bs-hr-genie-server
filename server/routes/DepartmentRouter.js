const Router = require("express");
const departmentController = require("../controller/DepartmentController.js");

const router = Router();

router.get("/", departmentController.getDepartments);
router.post("/", departmentController.createNewDepartment);
router.get("/:id", departmentController.getDepartmentByID);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
