const Router = require("express");
const { authController } = require("../controllers/controllers.js");

const router = Router();

router.post("/logout", authController.logoutAccount);
router.post("/refresh_token", authController.renewRefreshToken);
router.post("/register", authController.registerNewEmployee);

module.exports = router;
