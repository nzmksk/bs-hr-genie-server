const pool = require("../../../../app_config/db.js");
const queries = require("../../../../queries/queries.js");
const { getDepartments } = require("../../../../controller/DepartmentController.js");

// Mock pool connection
jest.mock("../../../../app_config/db.js");

describe("getDepartments", () => {
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

    getDepartments({}, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartments,
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockData });
  });

  test("Should return 'No data available.' message if data is not available", () => {
    pool.query.mockImplementationOnce((query, callback) => {
      callback(null, { rows: [] });
    });

    getDepartments({}, mockResponse);

    expect(pool.query).toHaveBeenCalledWith(
      queries.getDepartments,
      expect.any(Function)
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No data available.",
    });
  });

  test("Should handle internal server error", () => {
    const mockError = new Error("Internal server error.");

    pool.query.mockImplementationOnce((query, callback) => {
      callback(mockError);
    });

    getDepartments({}, mockResponse);

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
