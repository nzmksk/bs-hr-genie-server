const Router = require("express");
const { leaveQuotaController } = require("../../controllers/apiControllers.js");

const router = Router();

router.get("/", leaveQuotaController.getLeaveCount);

module.exports = router;
