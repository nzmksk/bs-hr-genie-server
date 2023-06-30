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
    const { email } = decodedToken;

    // Attach the email to the request object for later use if needed
    request.email = email;

    next();
  } catch (error) {
    return response.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};

module.exports = authMiddleware;
