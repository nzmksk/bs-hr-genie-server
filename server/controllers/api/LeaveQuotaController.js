const psqlQuery = require("../../services/psql/queries.js");
const pool = require("../../config/db.js");
const { GeneralLeaveQuotaModel } = require("../../models/models.js");

const getLeaveCount = async (request, response) => {
  try {
    const leaveCountQuery = {
      text: psqlQuery.getLeaveCount,
      values: [request.employeeId],
    };
    const leaveCountResult = await pool.query(leaveCountQuery);
    const leaveTypeArray = leaveCountResult.rows;

    if (leaveTypeArray.length > 0) {
      const data = leaveTypeArray.map((leaveType) => {
        const leaveObject = new GeneralLeaveQuotaModel(leaveType);
        return leaveObject;
      });

      return response.status(200).json({ data: data });
    } else {
      return response.status(404).json({ message: "Data not available." });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

module.exports = { getLeaveCount };
