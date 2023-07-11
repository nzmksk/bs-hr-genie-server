const redis = require("../../config/redis.js");

const blacklistToken = async (employeeId, accessToken, expiryTime) => {
  try {
    const currentTime = new Date();
    await redis.set(`${employeeId}:BT:${currentTime}`, accessToken, {
      EXAT: expiryTime,
    });
  } catch (error) {
    throw new Error(`redis.blacklistToken error: ${error.message}`);
  }
};

const deleteRefreshToken = async (employeeId) => {
  try {
    await redis.del(`${employeeId}:RT`);
  } catch (error) {
    throw new Error(`redis.deleteRefreshToken error: ${error.message}`);
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
      const blacklistedToken = await redis.get(key);
      blacklistArray.push(blacklistedToken);
    }

    return blacklistArray.includes(accessToken);
  } catch (error) {
    throw new Error(`redis.isTokenBlacklisted error: ${error.message}`);
  }
};

const saveActiveToken = async (employeeId, accessToken) => {
  try {
    await redis.set(`${employeeId}:AT`, accessToken);
  } catch (error) {
    throw new Error(`redis.saveActiveToken error: ${error.message}`);
  }
};

const saveRefreshToken = async (employeeId, refreshToken) => {
  try {
    await redis.set(`${employeeId}:RT`, refreshToken);
  } catch (error) {
    throw new Error(`redis.saveRefreshToken error: ${error.message}`);
  }
};

module.exports = {
  blacklistToken,
  deleteRefreshToken,
  getActiveToken,
  getRefreshToken,
  isTokenBlacklisted,
  saveActiveToken,
  saveRefreshToken,
};
