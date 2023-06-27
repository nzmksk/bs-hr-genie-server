const Router = require("express");
const leaveController = require("../controller/LeaveController.js");

const router = Router();

router.get("/", leaveController.getLeaveApplications);
router.get("/:id", leaveController.getLeaveApplicationsByDepartment);

module.exports = router;
