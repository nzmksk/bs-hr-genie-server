// Libraries
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
// Local files
const routes = require("./routes/routes.js");
const { authMiddleware } = require("./middlewares/middlewares.js");
// App
const app = express();
const port = process.env.HTTP_PORT ?? 3000;

// Middlewares
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON-encoded request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes
app.use("/", routes.accountRoutes);
// Protected routes
app.use("/", authMiddleware, routes.authRoutes);
app.use("/departments", authMiddleware, routes.departmentRoutes);
app.use("/employees", authMiddleware, routes.employeeRoutes);
app.use("/leaves", authMiddleware, routes.leaveRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
