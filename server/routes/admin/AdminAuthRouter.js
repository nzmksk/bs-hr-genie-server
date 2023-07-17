const Router = require("express");
const {
  adminAuthController,
} = require("../../controllers/adminControllers.js");

const router = Router();

router.post("/login", adminAuthController.adminLogin);

module.exports = router;
