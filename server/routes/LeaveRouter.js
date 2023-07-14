const Router = require("express");
const { leaveController } = require("../controllers/controllers.js");
const { roleAccessMiddleware } = require("../middlewares/middlewares.js");

const router = Router();

router.get(
  "/",
  roleAccessMiddleware(["admin", "manager", "employee"]),
  leaveController.getLeaveApplications
);
router.post(
  "/",
  roleAccessMiddleware(["admin", "manager", "employee"]),
  leaveController.applyLeave
);
router.get(
  "/:id",
  roleAccessMiddleware(["superadmin", "admin", "manager"]),
  leaveController.getLeaveApplicationsByDepartment
);
router.put(
  "/:id",
  roleAccessMiddleware(["admin", "manager"]),
  leaveController.approveRejectLeave
);
router.delete(
  "/:id",
  roleAccessMiddleware(["superadmin", "admin"]),
  leaveController.deleteLeaveApplication
);

module.exports = router;
