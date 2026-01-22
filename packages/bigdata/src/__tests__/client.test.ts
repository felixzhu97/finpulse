import { describe, it, expect, vi, beforeEach } from "@fintech/test-utils";
import { HttpClient } from "../client";
import type { BigDataConfig } from "../config";

// Mock global fetch
(globalThis as any).fetch = vi.fn();

describe("HttpClient", () => {
  describe("constructor", () => {
    it("should initialize with default config", () => {
      // Given
      const config: BigDataConfig = {};

      // When
      const client = new HttpClient(config);

      // Then
      expect(client).toBeDefined();
    });

    it("should use provided javaServiceUrl", () => {
      // Given
      const config: BigDataConfig = {
        javaServiceUrl: "http://custom-host:9090",
      };

      // When
      const client = new HttpClient(config);

      // Then
      expect(client).toBeDefined();
    });
  });

  describe("get()", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should send GET request and return JSON response", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      const mockResponse = { data: "test" };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        headers: {
          get: (key: string) => (key === "content-type" ? "application/json" : null),
        },
        json: async () => mockResponse,
      });

      // When
      const result = await client.get("/api/test");

      // Then
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should include query parameters in URL", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        headers: {
          get: (key: string) => (key === "content-type" ? "application/json" : null),
        },
        json: async () => ({}),
      });

      // When
      await client.get("/api/test", { param1: "value1", param2: "value2" });

      // Then
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("param1=value1"),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("param2=value2"),
        expect.any(Object)
      );
    });

    it("should throw error when response is not ok", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => null },
      });

      // When & Then
      await expect(client.get("/api/test")).rejects.toThrow("HTTP error! status: 404");
    });

    it("should handle binary response", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      const mockArrayBuffer = new ArrayBuffer(8);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        headers: {
          get: (key: string) =>
            key === "content-type" ? "application/octet-stream" : null,
        },
        arrayBuffer: async () => mockArrayBuffer,
      });

      // When
      const result = await client.get<Uint8Array>("/api/binary");

      // Then
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe("post()", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should send POST request with JSON body", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      const requestBody = { key: "value" };
      const mockResponse = { success: true };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        headers: {
          get: (key: string) => (key === "content-type" ? "application/json" : null),
        },
        json: async () => mockResponse,
      });

      // When
      const result = await client.post("/api/test", requestBody);

      // Then
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/test",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty response", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        headers: {
          get: (key: string) => null,
        },
      });

      // When
      const result = await client.post("/api/test");

      // Then
      expect(result).toEqual({});
    });

    it("should throw error with response message when request fails", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
        headers: { get: () => null },
      });

      // When & Then
      await expect(client.post("/api/test")).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });
  });

  describe("delete()", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should send DELETE request", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (key: string) => (key === "content-type" ? "application/json" : null),
        },
        json: async () => ({}),
      });

      // When
      await client.delete("/api/test");

      // Then
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/test",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should handle 204 No Content response", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
        headers: {
          get: (key: string) => null,
        },
      });

      // When
      const result = await client.delete("/api/test");

      // Then
      expect(result).toEqual({});
    });

    it("should handle absolute URL", async () => {
      // Given
      const config: BigDataConfig = { javaServiceUrl: "http://localhost:8080" };
      const client = new HttpClient(config);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (key: string) => null,
        },
      });

      // When
      await client.delete("http://other-host:9090/api/test");

      // Then
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://other-host:9090/api/test",
        expect.any(Object)
      );
    });
  });
});
