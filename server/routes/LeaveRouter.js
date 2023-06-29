const Router = require("express");
const leaveController = require("../controllers/LeaveController.js");

const router = Router();

router.get("/", leaveController.getLeaveApplications);
router.post("/", leaveController.applyLeave);
router.get("/:id", leaveController.getLeaveApplicationsByDepartment);
router.put("/:id", leaveController.approveRejectLeave);
router.delete("/:id", leaveController.deleteLeaveApplication);

module.exports = router;
