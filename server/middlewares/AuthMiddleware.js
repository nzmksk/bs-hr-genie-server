const jwt = require("jsonwebtoken");
const { redis } = require("../config/config.js");

const authMiddleware = async (request, response, next) => {
  const authorization = request.headers["authorization"];

  if (!authorization) {
    return response
      .status(401)
      .json({ error: "Authorization header missing." });
  }

  try {
    const accessToken = authorization.split(" ")[1];
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const { email, employeeId, employeeRole } = decodedToken;

    // Check if access token is blacklisted
    const blacklistedToken = await redis.get(`${employeeId}:AT`);

    if (accessToken === blacklistedToken) {
      return response.status(401).json({ error: "Authentication failed." });
    } else {
      // Attach the payload to the request object for later use if needed
      request.email = email;
      request.employeeId = employeeId;
      request.employeeRole = employeeRole;

      next();
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return response
        .status(400)
        .json({ error: "Access token expired. Please refresh your token." });
      } else {
      return response.status(401).json({ error: "Authentication failed." });
    }
  }
};

module.exports = authMiddleware;
