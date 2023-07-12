const jwt = require("jsonwebtoken");

const redisQuery = require("../services/redis/redisQueries.js");
const { verifyAccessToken } = require("../utils/tokens/tokens.js");

const authMiddleware = async (request, response, next) => {
  const authorization = request.headers["authorization"];

  if (!authorization) {
    return response
      .status(401)
      .json({ error: "Authorization header missing." });
  }

  try {
    const accessToken = authorization.split(" ")[1];
    const decodedToken = verifyAccessToken(accessToken);
    const { email, employeeId, employeeRole } = decodedToken;

    // Check if access token is blacklisted
    const isBlacklisted = await redisQuery.isTokenBlacklisted(
      employeeId,
      accessToken
    );

    if (isBlacklisted) {
      return response.status(401).json({ error: "Authentication failed." });
    }

    // Attach the payload to the request object for later use if needed
    request.email = email;
    request.employeeId = employeeId;
    request.employeeRole = employeeRole;

    next();
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
