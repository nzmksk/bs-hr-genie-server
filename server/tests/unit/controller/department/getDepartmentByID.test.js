const pool = require("../../../../app_config/db.js");
const queries = require("../../../../queries/queries.js");
const {
  getDepartmentByID,
} = require("../../../../controller/DepartmentController.js");

// Mock pool connection
jest.mock("../../../app_config/db.js");

describe("getDepartmentByID", () => {
  const mockRequest = { params: { id: "abc" } };
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

  test("Should return 'No data available.' message if data is not available", () => {
    pool.query.mockImplementationOnce((query, params, callback) => {
      callback(null, { rows: [] });
    });

    getDepartmentByID(mockRequest, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartmentByID,
      expect.any(Array),
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
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
});
