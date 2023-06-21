DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS leave_quota;
DROP TABLE IF EXISTS leave;

CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE role AS ENUM ('employee', 'manager', 'admin');

CREATE TABLE department(
    department_id VARCHAR(3) PRIMARY KEY,
    department_name VARCHAR(50)
);

CREATE TABLE employee(
    employee_id VARCHAR(6) PRIMARY KEY,
    department_id VARCHAR(3) NOT NULL REFERENCES department(department_id),
    role_type role DEFAULT 'employee',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(50) NOT NULL,
    hash_password VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    nric VARCHAR(12) NOT NULL,
    is_first_login BOOLEAN DEFAULT TRUE,
    is_probation BOOLEAN DEFAULT TRUE,
    is_married BOOLEAN DEFAULT FALSE,
    joined_date DATE,
    tenure INT DEFAULT 0,
    position_level INT DEFAULT 1,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (email)
);

CREATE TABLE leave_quota(
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id),
    annual_leave INT,
    sick_leave INT,
    parental_leave INT,
    emergency_leave INT
);

CREATE TABLE leave(
    leave_id VARCHAR(10) NOT NULL PRIMARY KEY,
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id),
    start_date DATE,
    duration INT,
    leave_type VARCHAR(20),
    reason VARCHAR(255),
    attachment BYTEA,
    is_pending BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_rejected_by VARCHAR(6)
);

INSERT INTO department (department_id, department_name)
VALUES ('HR', 'Human Resources'), ('BE', 'Backend Development');

INSERT INTO employee (employee_id, department_id, first_name, last_name, gender, email, hash_password, nric)
VALUES ('BE001', 'BE', 'Hafiz', 'Zabba', 'male', 'hafiz@besquare.com.my', '123testing', '123456789012');