import { hashToken } from "../src/utils/token.util";

describe("Token Utils", () => {
  describe("hashToken", () => {
    it("should hash a token correctly", () => {
      const token = "test-token-123";
      const hashed = hashToken(token);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe("string");
      expect(hashed).toHaveLength(64);
    });

    it("should consistently hash the same token", () => {
      const token = "test-token-123";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const hash1 = hashToken("token-1");
      const hash2 = hashToken("token-2");

      expect(hash1).not.toBe(hash2);
    });
  });
});
