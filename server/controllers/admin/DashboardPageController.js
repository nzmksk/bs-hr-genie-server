const psqlCrud = require("../../services/psql/crud.js");

const getEmployees = async (request, response) => {
  const currentPage = parseInt(request.query.page) || 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const employees = await psqlCrud.getEmployees();
  employees.forEach((employee) => {
    employee.joinedDate = employee.joinedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  });
  const paginatedEmployees = employees.slice(offset, offset + itemsPerPage);

  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return response.render("dashboard.njk", {
    currentPage,
    employees: paginatedEmployees,
    title: "Dashboard",
    totalEmployees: totalItems,
    totalPages,
  });
};

module.exports = { getEmployees };
