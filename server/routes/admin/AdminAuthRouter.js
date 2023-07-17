const Router = require("express");
const {
  adminAuthController,
} = require("../../controllers/adminControllers.js");

const router = Router();

router.get("/login", async (request, response) => {
  return response.render("login.njk");
});

router.post("/login", adminAuthController.adminLogin);

router.get("/dashboard", async (request, response) => {
  return response.render("dashboard.njk");
});

router.get("/employees", async (request, response) => {
  return response.render("employees.njk");
});

module.exports = router;
