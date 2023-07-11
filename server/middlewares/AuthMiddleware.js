const jwt = require("jsonwebtoken");
const {
  isTokenBlacklisted,
  verifyAccessToken,
} = require("../utils/tokens/tokens.js");

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
    // const isBlacklist = await isTokenBlacklisted(employeeId, accessToken);

    // if (isBlacklist) {
    //   console.log("blacklisted");
    //   return response.status(401).json({ error: "Authentication failed." });
    // } else {
      // Attach the payload to the request object for later use if needed
      request.email = email;
      request.employeeId = employeeId;
      request.employeeRole = employeeRole;

      next();
    // }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return response
        .status(400)
        .json({ error: "Access token expired. Please refresh your token." });
    } else {
      console.log('auth middle', error.message);
      return response.status(401).json({ error: "Authentication failed." });
    }
  }
};

module.exports = authMiddleware;
