const queries = require("../utils/queries/queries.js");
const { pool } = require("../config/config.js");
const { GeneralLeaveQuotaModel } = require("../models/models.js");

const getLeaveCount = async (request, response) => {
  try {
    const leaveCountQuery = {
      text: queries.getLeaveCount,
      values: [request.employeeId],
    };
    const leaveCountResult = await pool.query(leaveCountQuery);
    const leaveTypeArray = leaveCountResult.rows;

    if (leaveTypeArray.length > 0) {
      const data = leaveTypeArray.map(
        (leaveType) => new GeneralLeaveQuotaModel({ leaveType })
      );

      return response.status(200).json({ data: data });
    } else {
      return response.status(404).json({ message: "Data not available." });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

module.exports = { getLeaveCount };
