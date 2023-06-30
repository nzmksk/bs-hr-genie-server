const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

const middlewares = require("./middlewares/middlewares.js");
const routes = require("./routes/routes.js");

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
app.use("/", middlewares.authMiddleware, routes.authRoutes);
app.use("/departments", middlewares.authMiddleware, routes.departmentRoutes);
app.use("/employees", middlewares.authMiddleware, routes.employeeRoutes);
app.use("/leaves", middlewares.authMiddleware, routes.leaveRoutes);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
