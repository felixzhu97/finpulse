import { getAuthToken, setAuthToken } from "../authBridge";

describe("authBridge", () => {
  beforeEach(() => {
    setAuthToken(null);
  });

  describe("getAuthToken", () => {
    it("should return null when no token is set", () => {
      expect(getAuthToken()).toBeNull();
    });

    it("should return the token after setting it", () => {
      setAuthToken("test-token-123");
      expect(getAuthToken()).toBe("test-token-123");
    });

    it("should return null after clearing the token", () => {
      setAuthToken("test-token-123");
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });

    it("should handle empty string token", () => {
      setAuthToken("");
      expect(getAuthToken()).toBe("");
    });

    it("should handle JWT-like tokens", () => {
      const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHr0z5Y";
      setAuthToken(jwtToken);
      expect(getAuthToken()).toBe(jwtToken);
    });
  });

  describe("setAuthToken", () => {
    it("should set a valid token", () => {
      setAuthToken("valid-token");
      expect(getAuthToken()).toBe("valid-token");
    });

    it("should update token when called multiple times", () => {
      setAuthToken("first-token");
      expect(getAuthToken()).toBe("first-token");

      setAuthToken("second-token");
      expect(getAuthToken()).toBe("second-token");
    });

    it("should clear token when set to null", () => {
      setAuthToken("some-token");
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });
  });
});
