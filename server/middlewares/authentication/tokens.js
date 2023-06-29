const jwt = require("jsonwebtoken");

const createAccessToken = (email) => {
  return jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (email) => {
  return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const sendRefreshToken = (response, token) => {
  /**
   * For options parameter
   * @see https://expressjs.com/en/4x/api.html#res.cookie
   */
  const options = {
    httpOnly: true,
    path: "refresh_token",
  };
  response.cookie("hr-genie", token, options);
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
};
