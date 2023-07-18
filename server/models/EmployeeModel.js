const bcrypt = require("bcrypt");

class EmployeeModel {
  constructor({
    department_id,
    employee_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    position,
    hashed_password,
    password_updated,
    phone,
    nric,
    is_married,
    joined_date,
    profile_image,
    is_logged_in,
    created_at,
    last_login,
  }) {
    this.departmentId = department_id;
    this.employeeId = employee_id;
    this.employeeRole = employee_role;
    this.firstName = first_name;
    this.lastName = last_name;
    this.gender = gender;
    this.email = email;
    this.position = position;
    this.hashedPassword = hashed_password;
    this.isPasswordUpdated = password_updated;
    this.phone = phone;
    this.nric = nric;
    this.isMarried = is_married;
    this.joinedDate = joined_date;
    this.profileImage = profile_image;
    this.isLoggedIn = is_logged_in;
    this.createdAt = created_at;
    this.lastLogin = last_login;
    this.cleanedEmail = this.cleanEmail();
  }

  static fromCamelCaseObject(obj) {
    const snakeCaseObj = {
      department_id: obj.departmentId,
      employee_id: obj.employeeId,
      employee_role: obj.employeeRole,
      first_name: obj.firstName,
      last_name: obj.lastName,
      gender: obj.gender,
      email: obj.email,
      position: obj.position,
      hashed_password: obj.hashedPassword,
      password_updated: obj.isPasswordUpdated,
      phone: obj.phone,
      nric: obj.nric,
      is_married: obj.isMarried,
      joined_date: obj.joinedDate,
      profile_image: obj.profileImage,
      is_logged_in: obj.isLoggedIn,
      created_at: obj.createdAt,
      last_login: obj.lastLogin,
    };

    return new EmployeeModel(snakeCaseObj);
  }

  cleanEmail = () => {
    const [username, domain] = this.email.split("@");

    // Remove dots, underscores, and hyphens in username
    const regex = new RegExp(/[.\-_]/g);
    const cleanedUsername = username.replace(regex, "");
    const cleanedEmail = cleanedUsername + "@" + domain;

    return cleanedEmail;
  };

  encryptPassword = async (password) => {
    const saltRounds = 10;
    this.hashedPassword = await bcrypt.hash(password, saltRounds);

    return this.hashedPassword;
  };
}

module.exports = EmployeeModel;
