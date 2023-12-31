const Router = require("express");
const { employeeController } = require("../../controllers/apiControllers.js");
const {
  authMiddleware,
  roleAccessMiddleware,
} = require("../../middlewares/middlewares.js");
const router = Router();

router.get(
  "/",
  roleAccessMiddleware(["superadmin", "admin", "manager"]),
  employeeController.getEmployees
);
router.post(
  "/register",
  authMiddleware,
  roleAccessMiddleware(["superadmin", "admin"]),
  employeeController.registerNewEmployee
);
router.get(
  "/:id",
  roleAccessMiddleware(["superadmin", "admin", "manager"]),
  employeeController.getEmployeeById
);
router.put(
  "/:id",
  roleAccessMiddleware(["superadmin", "admin"]),
  employeeController.updateEmployeeDetails
);
router.delete(
  "/:id",
  roleAccessMiddleware(["superadmin", "admin"]),
  employeeController.deleteEmployee
);

module.exports = router;
