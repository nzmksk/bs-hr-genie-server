const logoutAccount = async (request, response) => {
  response.clearCookie("hr-genie", { path: "/refresh_token" });
  return response.status(200).json({ message: "Logout successful." });
};

module.exports = { logoutAccount };
