const Router = require("express");
const { leaveQuotaController } = require("../controllers/controllers.js");

const router = Router();

router.get("/", leaveQuotaController.getLeaveCount);

module.exports = router;
