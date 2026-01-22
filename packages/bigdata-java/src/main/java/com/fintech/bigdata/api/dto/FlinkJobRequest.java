package com.fintech.bigdata.api.dto;

import com.fintech.bigdata.flink.FlinkConfig;

/**
 * Flink 作业提交请求
 */
public class FlinkJobRequest {
    private FlinkConfig config;
    private String jobName;

    public FlinkConfig getConfig() {
        return config;
    }

    public void setConfig(FlinkConfig config) {
        this.config = config;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }
}
