const Router = require("express");
const homeController = require("../controller/HomeController.js");

const router = Router();

router.post("/register", homeController.registerNewEmployee);
router.post("/login", homeController.loginAccount);

module.exports = router;
