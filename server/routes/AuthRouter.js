const Router = require("express");
const { authController } = require("../controllers/controllers.js");
const { authMiddleware } = require("../middlewares/middlewares.js");

const router = Router();

router.post("/login", authController.loginAccount);
router.post("/logout", authMiddleware, authController.logoutAccount);
router.post("/refresh_token", authController.renewRefreshToken);
router.post("/register", authMiddleware, authController.registerNewEmployee);

module.exports = router;
