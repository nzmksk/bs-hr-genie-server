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
CREATE TYPE role_type AS ENUM (
    'employee',
    'manager',
    'admin',
    'resigned',
    'superadmin'
);
CREATE SEQUENCE employee_id_seq;
CREATE TABLE employee(
    department_id VARCHAR(3) NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    employee_id VARCHAR(6) PRIMARY KEY,
    employee_role role_type NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    hashed_password TEXT NOT NULL,
    phone VARCHAR(20),
    nric CHAR(12) NOT NULL,
    is_married BOOLEAN,
    joined_date DATE,
    profile_image BYTEA,
    is_logged_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    UNIQUE (email, nric)
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

CREATE TYPE leave_type AS ENUM (
    'annual',
    'medical',
    'parental',
    'emergency',
    'unpaid'
);
CREATE TABLE leave_category(
    leave_type_id SMALLSERIAL PRIMARY KEY,
    leave_type_name leave_type NOT NULL
);

CREATE TABLE leave_quota(
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    leave_type_id SMALLSERIAL NOT NULL REFERENCES leave_category(leave_type_id),
    quota SMALLINT NOT NULL
);

CREATE TYPE duration_type AS ENUM (
    'full-day',
    'first-half',
    'second-half'
);
CREATE TYPE status_type AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);
CREATE SEQUENCE leave_id_seq;
CREATE TABLE leave(
    leave_id VARCHAR(10) PRIMARY KEY,
    employee_id VARCHAR(6) NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    leave_type_id SMALLSERIAL NOT NULL REFERENCES leave_category(leave_type_id),
    start_date DATE,
    end_date DATE,
    duration duration_type,
    duration_length NUMERIC(2, 1),
    reason VARCHAR(255),
    attachment BYTEA,
    application_status status_type DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_rejected_by VARCHAR(6),
    reject_reason VARCHAR(255)
);

-- Generate leave ID based on employee's ID and leave type ID
CREATE OR REPLACE FUNCTION set_leave_id()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.leave_id := NEW.employee_id || '-' || NEW.leave_type_id || LPAD(CAST(NEXTVAL('leave_id_seq') AS VARCHAR), 2, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Call the function for each insertion on Leave table
CREATE TRIGGER set_leave_id_trigger
    BEFORE INSERT ON leave
    FOR EACH ROW
    EXECUTE FUNCTION set_leave_id();

INSERT INTO department (department_id, department_name)
VALUES ('HR', 'Human Resources');

INSERT INTO employee (
    department_id,
    employee_role,
    first_name,
    last_name,
    gender,
    email,
    position,
    hashed_password,
    phone,
    nric,
    is_married,
    joined_date,
    created_at
)
VALUES (
    'HR',
    'superadmin',
    'Super',
    'Admin',
    'male',
    'superadmin@admin.com',
    'Superadmin',
    '$2b$10$usOESTL8LtiFvynFOJOEuOPvdshPTSu98nLoZ/ERhypB8JrYPHL4C',
    '0123456789',
    '123456789012',
    'false',
    '1970-01-01',
    '1970-01-01 00:00:00'
),
(
    'HR',
    'employee',
    'Jane',
    'Doe',
    'female',
    'jane@domain.com',
    'Talent Acquisition Specialist',
    '$2b$10$usOESTL8LtiFvynFOJOEuOPvdshPTSu98nLoZ/ERhypB8JrYPHL4C',
    '0123456789',
    '123456789013',
    'true',
    '2023-03-06',
    '1970-01-01 00:00:00'
),
(
    'HR',
    'manager',
    'John',
    'Doe',
    'male',
    'john@domain.com',
    'Team Lead',
    '$2b$10$usOESTL8LtiFvynFOJOEuOPvdshPTSu98nLoZ/ERhypB8JrYPHL4C',
    '0123456789',
    '123456789014',
    'false',
    '2020-03-06',
    '1970-01-01 00:00:00'
);

INSERT INTO leave_category (leave_type_name)
VALUES ('annual'),
    ('medical'),
    ('parental'),
    ('emergency'),
    ('unpaid');

INSERT INTO leave (
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    duration,
    duration_length,
    application_status
)
VALUES ('HR003', 1, '2023-07-10', '2023-07-11', 'full-day', 2, 'approved'),
    ('HR003', 1, '2023-07-12', '2023-07-16', 'full-day', 5, 'rejected'),
    ('HR003', 1, '2023-07-12', '2023-07-16', 'first-half', 0.5, 'pending');

INSERT INTO leave_quota (employee_id, leave_type_id, quota)
VALUES ('HR001', 1, 20),
    ('HR001', 2, 22),
    ('HR001', 3, 0),
    ('HR001', 4, 20),
    ('HR001', 5, 60),
    ('HR002', 1, 8),
    ('HR002', 2, 14),
    ('HR002', 3, 98),
    ('HR002', 4, 8),
    ('HR002', 5, 60),
    ('HR003', 1, 16),
    ('HR003', 2, 18),
    ('HR003', 3, 0),
    ('HR003', 4, 16),
    ('HR003', 5, 60);