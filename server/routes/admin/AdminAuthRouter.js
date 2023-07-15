const Router = require("express");
const {
  adminAuthController,
} = require("../../controllers/adminControllers.js");

const router = Router();

router.get("/login", async (request, response) => {
  return response.render("login.njk");
});

router.post("/login", adminAuthController.adminLogin);

module.exports = router;
