const Router = require("express");
const { authController } = require("../controllers/controllers.js");

const router = Router();

router.post("/register", authController.registerNewEmployee);
router.post("/logout", authController.logoutAccount);

module.exports = router;
