const jwt = require("jsonwebtoken");

const clearCookie = (response) => {
  response.clearCookie("access-token");
  response.clearCookie("hrgenie", { path: "/refresh_token" });
};

const generateTokens = (email, employeeId, employeeRole) => {
  const payload = { email, employeeId, employeeRole };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    notBefore: "15m",
    expiresIn: "6h",
  });

  return [accessToken, refreshToken];
};

const sendAccessToken = (response, accessToken) => {
  const options = { httpOnly: true };
  response.cookie("access-token", accessToken, options);
};

const sendRefreshToken = (response, refreshToken) => {
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
  clearCookie,
  generateTokens,
  sendAccessToken,
  sendRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
