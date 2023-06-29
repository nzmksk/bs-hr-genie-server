const pool = require("../../../../config/db.js");
const queries = require("../../../../utils/queries/queries.js");
const {
  getDepartments,
} = require(".../../../../controllers/DepartmentController.js");

// Mock pool connection
jest.mock("../../../../config/db.js");

describe("getDepartments", () => {
  const mockRequest = {};
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return department data if available", () => {
    const mockData = [
      { id: 1, name: "Department 1" },
      { id: 2, name: "Department 2" },
    ];

    pool.query.mockImplementationOnce((query, callback) => {
      callback(null, { rows: mockData });
    });

    getDepartments(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartments,
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockData });
  });

  test("Should return error 404 if data is not available", () => {
    const mockData = [];

    pool.query.mockImplementationOnce((query, callback) => {
      callback(null, { rows: mockData });
    });

    getDepartments(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartments,
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

    pool.query.mockImplementationOnce((query, callback) => {
      callback(mockError);
    });

    getDepartments(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartments,
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
  });
});
