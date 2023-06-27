const Router = require("express");
const leaveController = require("../controller/LeaveController.js");

const router = Router();

router.get("/", leaveController.getLeaveApplications);
router.post("/", leaveController.applyLeave);
router.get("/:id", leaveController.getLeaveApplicationsByDepartment);

module.exports = router;
