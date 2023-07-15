const Router = require("express");
const { authController } = require("../../controllers/apiControllers.js");
const {
  authMiddleware,
  roleAccessMiddleware,
} = require("../../middlewares/middlewares.js");

const router = Router();

router.post("/login", authController.loginAccount);
router.post("/refresh_token", authController.renewRefreshToken);

// Protected routes
router.post(
  "/first_login",
  authMiddleware,
  roleAccessMiddleware(["admin", "manager", "employee"]),
  authController.firstTimeLogin
);
router.post("/logout", authMiddleware, authController.logoutAccount);

module.exports = router;
