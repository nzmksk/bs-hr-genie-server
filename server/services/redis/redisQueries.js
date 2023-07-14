const jwt = require("jsonwebtoken");

const redis = require("../../config/redis.js");

const blacklistToken = async (employeeId) => {
  try {
    const activeToken = await getActiveToken(employeeId);
    const decodedToken = jwt.decode(activeToken);
    const expiryTime = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (expiryTime > currentTime) {
      await redis.set(`${employeeId}:BT:${expiryTime}`, activeToken, {
        EXAT: expiryTime,
      });
    }
  } catch (error) {
    throw new Error(`redis.blacklistToken error: ${error.message}`);
  }
};

const deleteTokens = async (employeeId) => {
  try {
    await redis.del(`${employeeId}:AT`);
    await redis.del(`${employeeId}:RT`);
  } catch (error) {
    throw new Error(`redis.deleteTokens error: ${error.message}`);
  }
};

const getActiveToken = async (employeeId) => {
  try {
    const activeToken = await redis.get(`${employeeId}:AT`);
    return activeToken;
  } catch (error) {
    throw new Error(`redis.getActiveToken error: ${error.message}`);
  }
};

const getRefreshToken = async (employeeId) => {
  try {
    const refreshToken = await redis.get(`${employeeId}:RT`);
    return refreshToken;
  } catch (error) {
    throw new Error(`redis.getRefreshToken error: ${error.message}`);
  }
};

const isTokenBlacklisted = async (employeeId, accessToken) => {
  try {
    let blacklistArray = [];

    const patternOptions = ["MATCH", `${employeeId}:BT*`];

    for await (const key of redis.scanIterator(0, patternOptions)) {
      if (key.startsWith(`${employeeId}:BT`)) {
        const blacklistedToken = await redis.get(key);
        blacklistArray.push(blacklistedToken);
      }
    }

    return blacklistArray.includes(accessToken);
  } catch (error) {
    throw new Error(`redis.isTokenBlacklisted error: ${error.message}`);
  }
};

const saveTokens = async (employeeId, accessToken, refreshToken) => {
  try {
    await redis.set(`${employeeId}:AT`, accessToken);
    await redis.set(`${employeeId}:RT`, refreshToken);
  } catch (error) {
    throw new Error(`redis.saveTokens error: ${error.message}`);
  }
};

module.exports = {
  blacklistToken,
  deleteTokens,
  getActiveToken,
  getRefreshToken,
  isTokenBlacklisted,
  saveTokens,
};
