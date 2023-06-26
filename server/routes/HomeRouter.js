const Router = require("express");
const homeController = require("../controller/HomeController.js");

const router = Router();

router.post("/login", homeController.loginAccount);
router.post("/register", homeController.registerNewEmployee);

module.exports = router;
