DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS leave_category;
DROP TABLE IF EXISTS leave_quota;
DROP TABLE IF EXISTS leave;

CREATE TABLE department(
    department_id VARCHAR(3) PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL,
    UNIQUE (department_name)
);

CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE role_type AS ENUM ('employee', 'manager', 'admin', 'resigned');
CREATE SEQUENCE employee_id_seq;
CREATE TABLE employee(
    department_id VARCHAR(3) NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    employee_id VARCHAR(6) PRIMARY KEY,
    employee_role role_type NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(50) NOT NULL,
    hash_password VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    nric CHAR(12) NOT NULL,
    is_probation BOOLEAN,
    is_married BOOLEAN,
    joined_date DATE,
    profile_image BYTEA,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (email)
);

-- Generate employee's ID based on employee's department ID
CREATE OR REPLACE FUNCTION set_employee_id()
    RETURNS TRIGGER AS
$$
DECLARE
    max_employee_id SMALLINT;
BEGIN
    SELECT MAX(CAST(SUBSTRING(employee_id FROM '\d+') AS SMALLINT))
    INTO max_employee_id
    FROM employee
    WHERE department_id = NEW.department_id;

    IF max_employee_id IS NULL THEN
        max_employee_id := 0;
    END IF;

    NEW.employee_id := NEW.department_id || LPAD(CAST(max_employee_id + 1 AS VARCHAR), 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Call the function for each insertion on Employee table
CREATE TRIGGER set_employee_id_trigger
    BEFORE INSERT ON employee
    FOR EACH ROW
    EXECUTE FUNCTION set_employee_id();

CREATE TYPE leave_type AS ENUM ('annual', 'medical', 'parental', 'emergency', 'unpaid');
CREATE TABLE leave_category(
    leave_type_id SMALLSERIAL PRIMARY KEY,
    leave_type_name leave_type NOT NULL
);

CREATE TABLE leave_quota(
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    leave_type_id SMALLSERIAL NOT NULL REFERENCES leave_category(leave_type_id),
    quota SMALLINT NOT NULL
);

CREATE TYPE duration_type AS ENUM ('full-day', 'first-half', 'second-half');
CREATE TYPE status_type AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE SEQUENCE leave_id_seq;
CREATE TABLE leave(
    leave_id VARCHAR(10) PRIMARY KEY,
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    leave_type_id SMALLSERIAL NOT NULL REFERENCES leave_category(leave_type_id),
    start_date DATE,
    end_date DATE,
    duration duration_type,
    reason VARCHAR(255),
    attachment BYTEA,
    application_status status_type DEFAULT 'pending',
    approved_rejected_by VARCHAR(6),
    reject_reason VARCHAR(255)
);

-- Generate leave ID based on employee's ID and leave type ID
CREATE OR REPLACE FUNCTION set_leave_id()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.leave_id := NEW.employee_id || '-' || NEW.leave_type_id || LPAD(CAST(NEXTVAL('leave_id_seq') AS VARCHAR), 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Call the function for each insertion on Leave table
CREATE TRIGGER set_leave_id_trigger
    BEFORE INSERT ON leave
    FOR EACH ROW
    EXECUTE FUNCTION set_leave_id();

INSERT INTO department (department_id, department_name)
VALUES ('HR', 'Human Resources'), ('BE', 'Backend Development');

INSERT INTO employee (department_id, employee_role, first_name, last_name, gender, email, hash_password, nric)
VALUES ('BE', 'employee', 'Hafiz', 'Zabba', 'male', 'hafiz@besquare.com.my', '123testing', '123456789012');