const makeTransaction = async (
  queryObjectArray,
  successStatusCode,
  message
) => {
  let statusCode;
  let successMessage;
  let errorMessage;

  try {
    await pool.query("BEGIN");

    queryObjectArray.forEach(async (queryObject) => {
      await pool.query(queryObject);
    });

    await pool.query("COMMIT");

    statusCode = successStatusCode;
    successMessage = message;
  } catch (error) {
    await pool.query("ROLLBACK");
    statusCode = 500;
    errorMessage = error.message;
  } finally {
    return { statusCode, successMessage, errorMessage };
  }
};

module.exports = { makeTransaction };
