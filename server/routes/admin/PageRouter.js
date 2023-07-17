const Router = require("express");

const router = Router();

router.get("/login", async (request, response) => {
  return response.render("login.njk");
});
router.get("/dashboard", async (request, response) => {
  return response.render("dashboard.njk");
});
router.get("/employees", async (request, response) => {
  return response.render("employees.njk");
});
router.get("/leaves", async (request, response) => {
  return response.render("leaves.njk");
});
router.get("/departments", async (request, response) => {
  return response.render("departments.njk");
});

module.exports = router;
