const roleAccessMiddleware =
  (authorizedRoles) => async (request, response, next) => {
    const role = request.employeeRole;

    return authorizedRoles.includes(role)
      ? next()
      : response.status(403).json({ error: "Access denied." });
  };

module.exports = roleAccessMiddleware;
