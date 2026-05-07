import { createAppError } from "../src/utils/error.util";

describe("Error Utils", () => {
  describe("createAppError", () => {
    it("should create an error with correct properties", () => {
      const error = createAppError("Test error", 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it("should set status to fail for 4xx errors", () => {
      const error = createAppError("Bad request", 400);
      expect(error.status).toBe("fail");
    });

    it("should set status to error for 5xx errors", () => {
      const error = createAppError("Server error", 500);
      expect(error.status).toBe("error");
    });

    it("should mark error as operational", () => {
      const error = createAppError("Test error", 401);
      expect(error.isOperational).toBe(true);
    });
  });
});
