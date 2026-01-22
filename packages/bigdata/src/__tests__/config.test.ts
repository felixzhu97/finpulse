import { describe, it, expect, beforeEach } from "@fintech/test-utils";
import { getBigDataConfig, type BigDataConfig } from "../config";

describe("config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.BIGDATA_JAVA_SERVICE_URL;
    delete process.env.SPARK_LIVY_URL;
    delete process.env.FLINK_REST_URL;
    delete process.env.HADOOP_HDFS_URL;
  });

  describe("getBigDataConfig()", () => {
    describe("when no config provided", () => {
      it("should return default config with localhost URL", () => {
        // When
        const config = getBigDataConfig();

        // Then
        expect(config.javaServiceUrl).toBe("http://localhost:8080");
        expect(config.spark).toBeDefined();
        expect(config.flink).toBeDefined();
        expect(config.hadoop).toBeDefined();
      });
    });

    describe("when config provided", () => {
      it("should use provided config values", () => {
        // Given
        const providedConfig: Partial<BigDataConfig> = {
          javaServiceUrl: "http://custom-host:9090",
          spark: {
            livyUrl: "http://spark-host:8998",
          },
        };

        // When
        const config = getBigDataConfig(providedConfig);

        // Then
        expect(config.javaServiceUrl).toBe("http://custom-host:9090");
        expect(config.spark?.livyUrl).toBe("http://spark-host:8998");
      });
    });

    describe("when environment variables are set", () => {
      it("should read from environment variables", () => {
        // Given
        process.env.BIGDATA_JAVA_SERVICE_URL = "http://env-host:8080";
        process.env.SPARK_LIVY_URL = "http://env-spark:8998";
        process.env.FLINK_REST_URL = "http://env-flink:8081";
        process.env.HADOOP_HDFS_URL = "hdfs://env-hadoop:9000";

        // When
        const config = getBigDataConfig();

        // Then
        expect(config.javaServiceUrl).toBe("http://env-host:8080");
        expect(config.spark?.livyUrl).toBe("http://env-spark:8998");
        expect(config.flink?.restUrl).toBe("http://env-flink:8081");
        expect(config.hadoop?.hdfsUrl).toBe("hdfs://env-hadoop:9000");
      });

      it("should prioritize provided config over environment variables", () => {
        // Given
        process.env.BIGDATA_JAVA_SERVICE_URL = "http://env-host:8080";
        const providedConfig: Partial<BigDataConfig> = {
          javaServiceUrl: "http://provided-host:9090",
        };

        // When
        const config = getBigDataConfig(providedConfig);

        // Then
        expect(config.javaServiceUrl).toBe("http://provided-host:9090");
      });
    });
  });
});
