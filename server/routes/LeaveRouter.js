const Router = require("express");
const leaveController = require("../controller/LeaveController.js");

const router = Router();

router.get("/", leaveController.getLeaveApplications);

module.exports = router;
