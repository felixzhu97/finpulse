package com.fintech.bigdata.api.dto;

/**
 * Spark 会话创建响应
 */
public class SparkSessionResponse {
    private String sessionId;
    private String applicationId;

    public SparkSessionResponse() {
    }

    public SparkSessionResponse(String sessionId, String applicationId) {
        this.sessionId = sessionId;
        this.applicationId = applicationId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }
}
