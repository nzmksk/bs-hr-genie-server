// Libraries
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const nunjucks = require("nunjucks");

// Local files
const adminRoutes = require("./routes/adminRoutes.js");
const apiRoutes = require("./routes/apiRoutes.js");
const {
  authMiddleware,
  roleAccessMiddleware,
} = require("./middlewares/middlewares.js");

// App configuration
const app = express();
const port = process.env.HTTP_PORT ?? 3000;
nunjucks.configure("views", { autoescape: true, express: app });
app.engine("njk", nunjucks.render);
app.set("view engine", "njk");
app.set("views", __dirname + "/views");

// Middlewares
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON-encoded request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// SSR ROUTES
app.use("/admin", adminRoutes.adminAuthRoutes);

// API ROUTES
app.use("/api/v1/", apiRoutes.authRoutes);
// Protected routes
app.use(
  "/api/v1/departments",
  authMiddleware,
  roleAccessMiddleware(["superadmin", "admin"]),
  apiRoutes.departmentRoutes
);
app.use("/api/v1/employees", authMiddleware, apiRoutes.employeeRoutes);
app.use("/api/v1/leaves", authMiddleware, apiRoutes.leaveRoutes);
app.use("/api/v1/leave_quota", authMiddleware, apiRoutes.leaveQuotaRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
