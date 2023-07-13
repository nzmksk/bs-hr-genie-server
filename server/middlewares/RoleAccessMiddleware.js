const roleAccessMiddleware =
  (authorizedRoles) => async (request, response, next) => {
    const role = request.employeeRole;

    return authorizedRoles.includes(role)
      ? next()
      : response.status(403).json({ message: "Access denied." });
  };

module.exports = roleAccessMiddleware;
