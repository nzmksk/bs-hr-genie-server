const Router = require("express");
const accountController = require("../controllers/AccountController.js");

const router = Router();

router.post("/login", accountController.loginAccount);
router.post("/register", accountController.registerNewEmployee);

module.exports = router;
