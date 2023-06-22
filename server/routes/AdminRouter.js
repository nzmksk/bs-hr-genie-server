const Router = require("express");
const adminController = require("../controller/AdminController.js");

const router = Router();

router.post("/register", adminController.registerAdmin);

module.exports = router;
