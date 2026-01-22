package com.fintech.bigdata.flink;

import java.util.HashMap;
import java.util.Map;

/**
 * Flink 配置类
 */
public class FlinkConfig {
    private String jobName;
    private Integer parallelism;
    private Long checkpointInterval;
    private String checkpointPath;
    private Map<String, String> configs;

    public FlinkConfig() {
        this.configs = new HashMap<>();
    }

    public FlinkConfig(String jobName) {
        this();
        this.jobName = jobName;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public Integer getParallelism() {
        return parallelism;
    }

    public void setParallelism(Integer parallelism) {
        this.parallelism = parallelism;
    }

    public Long getCheckpointInterval() {
        return checkpointInterval;
    }

    public void setCheckpointInterval(Long checkpointInterval) {
        this.checkpointInterval = checkpointInterval;
    }

    public String getCheckpointPath() {
        return checkpointPath;
    }

    public void setCheckpointPath(String checkpointPath) {
        this.checkpointPath = checkpointPath;
    }

    public Map<String, String> getConfigs() {
        return configs;
    }

    public void setConfigs(Map<String, String> configs) {
        this.configs = configs;
    }

    public void addConfig(String key, String value) {
        this.configs.put(key, value);
    }
}
