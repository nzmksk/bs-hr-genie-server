const Router = require("express");
const {
  dashboardPageController,
} = require("../../controllers/adminControllers.js");

const router = Router();

router.get("/login", async (request, response) => {
  return response.render("login.njk");
});
router.get("/dashboard", dashboardPageController.getEmployees);
router.get("/employees", async (request, response) => {
  return response.render("employees.njk", { title: "Employees" });
});
router.get("/leaves", async (request, response) => {
  return response.render("leaves.njk", { title: "Leaves" });
});
router.get("/departments", async (request, response) => {
  return response.render("departments.njk", { title: "Departments" });
});

module.exports = router;
