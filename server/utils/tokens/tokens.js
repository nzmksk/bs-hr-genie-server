const jwt = require("jsonwebtoken");

const createAccessToken = (email, employeeId, employeeRole) => {
  return jwt.sign(
    { email, employeeId, employeeRole },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const createRefreshToken = (email, employeeId, employeeRole) => {
  return jwt.sign(
    { email, employeeId, employeeRole },
    process.env.REFRESH_TOKEN_SECRET,
    {
      notBefore: "15m",
      expiresIn: "6h",
    }
  );
};

const sendRefreshToken = (response, refreshToken) => {
  /**
   * For options parameter
   * @see https://expressjs.com/en/4x/api.html#res.cookie
   */
  const options = {
    httpOnly: true,
    path: "/refresh_token",
  };
  response.cookie("hrgenie", refreshToken, options);
};

const verifyAccessToken = (accessToken) => {
  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  return decodedToken;
};

const verifyRefreshToken = (refreshToken) => {
  const decodedToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  return decodedToken;
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
