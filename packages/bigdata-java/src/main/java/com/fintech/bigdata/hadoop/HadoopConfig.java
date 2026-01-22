package com.fintech.bigdata.hadoop;

import java.util.HashMap;
import java.util.Map;

/**
 * Hadoop 配置类
 */
public class HadoopConfig {
    private String defaultFS;
    private String userName;
    private Map<String, String> configs;

    public HadoopConfig() {
        this.configs = new HashMap<>();
    }

    public String getDefaultFS() {
        return defaultFS;
    }

    public void setDefaultFS(String defaultFS) {
        this.defaultFS = defaultFS;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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
