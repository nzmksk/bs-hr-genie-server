const jwt = require("jsonwebtoken");

const authMiddleware = (request, response, next) => {
  const authorization = request.headers["authorization"];

  if (!authorization) {
    return response
      .status(401)
      .json({ error: "Unauthorized. Authorization header missing." });
  }

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { employeeId, employeeRole } = decodedToken;

    // Attach the payload to the request object for later use if needed
    request.employeeId = employeeId;
    request.employeeRole = employeeRole;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return response.redirect("/refresh_token");
    }
    return response.status(500).json({ error: `${error.message}` });
  }
};

module.exports = authMiddleware;
