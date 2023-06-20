// import database from './db.js'
class Users {
    constructor(database) {
      this.users = {};
      this.database = database;
      this.connection = database.connection;
    }
  
    async add(req, res) {
      const { email, firstName, lastName, languages } = req.body;
  
      if (!email) {
        return this._sendError(res, 400, "MISSING_EMAIL");
      }
      // TO-DO: Perform DB query here to get user_details related to email passed
      const user_details = await this.connection.query(
        `SELECT * FROM users WHERE email = '${email}'`
      );
  
      // Already exists in DB
      if (user_details.rows.length) {
        return this._sendError(res, 400, "DUPLICATE_EMAIL");
      }
  
      //TO-DO: Insert user details in db
      this.users[user] = req.body
  
      return this._sendResponse(res, { result: "Added successfully." });
    }
  
    async list(req, res) {
      const result = await this.connection.query("SELECT * from users");
      return this._sendResponse(res, result.rows);
    }
  
    async get(req, res) {
      const email = req.params.email;
      if (!email) {
        return this._sendError(res, 400, "MISSING_EMAIL");
      }
  
      //TO-DO: get personal_details from db related to email passed
      const personal_details = await this.connection.query(
        `SELECT * FROM users WHERE email = '${email}'`
      );
  
      if (!personal_details.result.length) {
        return this._sendError(res, 404, "NOT_FOUND");
      }
  
      return this._sendResponse(res, personal_details);
    }
  
    async delete(req, res) {
      const { email } = req.body;
      if (!email) {
        return this._sendError(res, 400, "MISSING_EMAIL");
      }
  
      //TO-DO: Add a delete query to delete user having email same as email passed as parameter
      this._sendResponse(res, { result: "Deleted successfully." });
    }
  
    // ----- Helper Methods -----
    _sendResponse(res, body) {
      res.status(200).send(body || {});
    }
  
    _sendError(res, status, code) {
      res.status(status).send({ error: code || "UNKNOWN_ERROR" });
    }
  }
  
  export default Users;
  