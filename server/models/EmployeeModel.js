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
    hashed_password,
    phone,
    nric,
    is_probation,
    is_married,
    joined_date,
    profile_image,
    created_at,
    refresh_token,
  }) {
    this.departmentId = department_id;
    this.employeeId = employee_id;
    this.employeeRole = employee_role;
    this.firstName = first_name;
    this.lastName = last_name;
    this.gender = gender;
    this.email = email;
    this.hashedPassword = hashed_password;
    this.phone = phone;
    this.nric = nric;
    this.isProbation = is_probation;
    this.isMarried = is_married;
    this.joinedDate = joined_date;
    this.profileImage = profile_image;
    this.createdAt = created_at;
    this.refreshToken = refresh_token;
    this.cleanedEmail = this.cleanEmail();
  }

  cleanEmail = () => {
    const [username, domain] = this.email.split("@");

    // Remove dots, underscores, and hyphens in username
    const regex = new RegExp(/[.\-_]/g);
    const cleanedUsername = username.replace(regex, "");

    const cleanedEmail = cleanedUsername + "@" + domain;
    return cleanedEmail;
  };

  encryptPassword = async () => {
    const saltRounds = 10;
    this.hashedPassword = await bcrypt.hash(this.nric, saltRounds);
    return this.hashedPassword;
  };
}

module.exports = EmployeeModel;
