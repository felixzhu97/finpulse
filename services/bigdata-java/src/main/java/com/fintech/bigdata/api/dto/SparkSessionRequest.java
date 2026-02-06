package com.fintech.bigdata.api.dto;

import com.fintech.bigdata.spark.SparkConfig;

/**
 * Spark 会话创建请求
 */
public class SparkSessionRequest {
    private SparkConfig config;

    public SparkConfig getConfig() {
        return config;
    }

    public void setConfig(SparkConfig config) {
        this.config = config;
    }
}
