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
      expiresIn: "1d",
    }
  );
};

const sendRefreshToken = (response, token) => {
  /**
   * For options parameter
   * @see https://expressjs.com/en/4x/api.html#res.cookie
   */
  const options = {
    httpOnly: true,
    path: "/refresh_token",
  };
  response.cookie("hrgenie", token, options);
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
