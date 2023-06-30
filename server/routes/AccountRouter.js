const Router = require("express");
const { accountController } = require("../controllers/controllers.js");

const router = Router();

router.post("/login", accountController.loginAccount);

module.exports = router;
