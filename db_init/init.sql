DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permission;
DROP TABLE IF EXISTS role_permission;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS leave_quota;
DROP TABLE IF EXISTS leave;

CREATE TABLE department(
    department_id VARCHAR(3) PRIMARY KEY,
    department_name VARCHAR(50)
);

CREATE TABLE roles(
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE permission(
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL
);

CREATE TABLE role_permission(
    role_id INT NOT NULL REFERENCES roles(role_id),
    permission_id INT NOT NULL REFERENCES permission(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE employee(
    employee_id VARCHAR(6) PRIMARY KEY,
    department_id VARCHAR(3) NOT NULL REFERENCES department(department_id),
    role_id INT NOT NULL REFERENCES roles(role_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
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
    created_at DATE
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
