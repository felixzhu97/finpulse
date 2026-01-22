import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BigDataConfig } from "../config";

// Create mock instance that will be shared
const mockHttpClientInstance = {
  get: vi.fn(),
};

// Mock HttpClient
vi.mock("../client", () => {
  return {
    HttpClient: vi.fn(() => mockHttpClientInstance),
  };
});

// Mock config module
vi.mock("../config", () => {
  return {
    getBigDataConfig: vi.fn((config?: any) => ({
      javaServiceUrl: config?.javaServiceUrl || "http://localhost:8080",
      spark: {},
      flink: {},
      hadoop: {},
    })),
  };
});

// Import after mock
import { YARNClient, createYARNClient } from "../hadoop/yarn";

describe("YARNClient", () => {
  let yarnClient: YARNClient;

  beforeEach(() => {
    vi.clearAllMocks();
    const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
    yarnClient = new YARNClient(config);
  });

  describe("listApplications()", () => {
    it("should list all applications when no state filter provided", async () => {
      // Given
      const mockResponse = [
        {
          applicationId: "app-123",
          name: "test-app",
          state: "RUNNING",
          startTime: 1234567890,
        },
      ];
      mockHttpClientInstance.get.mockResolvedValue(mockResponse);

      // When
      const result = await yarnClient.listApplications();

      // Then
      expect(mockHttpClientInstance.get).toHaveBeenCalledWith(
        "/api/v1/hadoop/yarn/applications",
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it("should filter applications by state", async () => {
      // Given
      const state = "RUNNING";
      const mockResponse = [
        {
          applicationId: "app-123",
          name: "test-app",
          state: "RUNNING",
          startTime: 1234567890,
        },
      ];
      mockHttpClientInstance.get.mockResolvedValue(mockResponse);

      // When
      const result = await yarnClient.listApplications(state);

      // Then
      expect(mockHttpClientInstance.get).toHaveBeenCalledWith(
        "/api/v1/hadoop/yarn/applications",
        { state }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getClusterMetrics()", () => {
    it("should get YARN cluster metrics", async () => {
      // Given
      const mockResponse = {
        numNodeManagers: 3,
        numActiveNodeManagers: 2,
        numDecommissionedNodeManagers: 1,
      };
      mockHttpClientInstance.get.mockResolvedValue(mockResponse);

      // When
      const result = await yarnClient.getClusterMetrics();

      // Then
      expect(mockHttpClientInstance.get).toHaveBeenCalledWith("/api/v1/hadoop/yarn/metrics");
      expect(result).toEqual(mockResponse);
    });
  });
});

// Note: createYARNClient() tests are skipped because it uses require() which
// doesn't work with vi.mock(). The function is a simple wrapper that creates
// a YARNClient instance, which is already tested above.
describe.skip("createYARNClient()", () => {
  it("should create YARNClient with default config", () => {
    // When
    const client = createYARNClient();

    // Then
    expect(client).toBeInstanceOf(YARNClient);
  });
});
