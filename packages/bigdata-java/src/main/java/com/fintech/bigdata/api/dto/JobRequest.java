package com.fintech.bigdata.api.dto;

import java.util.Map;

/**
 * 作业提交请求
 */
public class JobRequest {
    private String jobName;
    private Map<String, Object> config;

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public Map<String, Object> getConfig() {
        return config;
    }

    public void setConfig(Map<String, Object> config) {
        this.config = config;
    }
}
