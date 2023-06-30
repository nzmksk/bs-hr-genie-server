const DatabaseError = require("../../../../utils/errors/DatabaseError.js");
const pool = require("../../../../config/db.js");
const queries = require("../../../../utils/queries/queries.js");
const { createDepartment } = require("../../../../controllers/controllers.js");

jest.mock("../../../../config/db.js");

describe("createDepartment", () => {
  const mockRequest = {
    body: {
      department_id: "BE",
      department_name: "Backend Development",
    },
  };
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockDatabaseError = new DatabaseError(
    "Database error - Unique violation",
    "23505"
  );
  const mockError = new Error("Internal server error.");

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should create a new department successfully", () => {
    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: [] });
    });

    // Mocking pool.query to create department
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, {
        rows: [{ department_id: "BE", department_name: "Backend Development" }],
      });
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { department_id: "BE", department_name: "Backend Development" },
      message: "Department has been successfully created.",
    });
  });

  test("Should return error 409 if department ID already exists", () => {
    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, {
        rows: [
          {
            department_id: "BE",
            department_name: "Backend Development",
          },
        ],
      });
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { department_id: "BE", department_name: "Backend Development" },
      message: "Department already exists.",
    });
  });

  test("Should return error 409 if department name already exists", () => {
    const mockRequest = {
      body: {
        department_id: "BAE",
        department_name: "Backend Development",
      },
    };

    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: [] });
    });

    // Mocking pool.query to make request to create department
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockDatabaseError);
    });

    // Mocking pool.query to check existing department name
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, {
        rows: [
          {
            department_id: "BE",
            department_name: "Backend Development",
          },
        ],
      });
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { department_id: "BE", department_name: "Backend Development" },
      message: "Department already exists.",
    });
  });

  test("Should return error 400 if department ID is too short", () => {
    const mockRequest = {
      body: {
        department_id: "A",
        department_name: "Accounting",
      },
    };

    createDepartment(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Department ID must be 2-3 characters.",
    });
  });

  test("Should return error 400 if department ID is too long", () => {
    const mockRequest = {
      body: {
        department_id: "MATH",
        department_name: "Mathematics",
      },
    };

    createDepartment(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Department ID must be 2-3 characters.",
    });
  });

  test("Should handle internal server error in the first pool.query", () => {
    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockError);
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
  });

  test("Should handle internal server error in the second pool.query", () => {
    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: [] });
    });

    // Mocking pool.query to create department
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockError);
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
  });

  test("Should handle internal server error in the third pool.query", () => {
    // Mocking pool.query to check existing department ID
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: [] });
    });

    // Mocking pool.query to make request to create department
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockDatabaseError);
    });

    // Mocking pool.query to check existing department name
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockError);
    });

    createDepartment(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
  });
});
