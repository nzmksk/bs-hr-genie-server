const Router = require("express");
const controller = require("../controller/DepartmentController.js");

const router = Router();

router.get("/", controller.getDepartments);

module.exports = router;
