const pool = require("../../../../config/db.js");
const queries = require("../../../../utils/queries/queries.js");
const { getDepartmentByID } = require("../../../../controllers/controllers.js");

// Mock pool connection
jest.mock("../../../../config/db.js");

describe("getDepartmentByID", () => {
  const mockRequest = { params: { id: "ABC" } };
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return department data if available", () => {
    const mockData = [{ id: "ABC", name: "Department 1" }];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: mockData });
    });

    getDepartmentByID(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockData[0] });
  });

  test("Should return error 404 if data is not available", () => {
    const mockData = [];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: mockData });
    });

    getDepartmentByID(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockData,
      message: "No data available.",
    });
  });

  test("Should handle internal server error", () => {
    const mockError = new Error("Internal server error.");

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(mockError);
    });

    getDepartmentByID(mockRequest, mockResponse);

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

  test("ID parameter should be case-insensitive", () => {
    const mockRequest = { params: { id: "abc" } };
    const mockData = [{ id: "ABC", name: "Department 1" }];

    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: mockData });
    });

    getDepartmentByID(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockData[0] });
  });
});
