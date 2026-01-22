package com.fintech.bigdata.api.dto;

/**
 * 作业提交响应
 */
public class JobResponse {
    private String jobId;
    private String status;

    public JobResponse() {
    }

    public JobResponse(String jobId) {
        this.jobId = jobId;
        this.status = "SUBMITTED";
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
