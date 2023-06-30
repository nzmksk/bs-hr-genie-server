const Router = require("express");
const { authController } = require("../controllers/controllers.js");

const router = Router();

router.post("/logout", authController.logoutAccount);

module.exports = router;
