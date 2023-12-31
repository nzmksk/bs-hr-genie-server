const Router = require("express");
const { departmentController } = require("../../controllers/apiControllers.js");

const router = Router();

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getDepartments);
router.get("/:id", departmentController.getDepartmentByID);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
