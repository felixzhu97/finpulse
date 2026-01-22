package com.fintech.bigdata.spark;

import java.util.HashMap;
import java.util.Map;

/**
 * Spark 配置类
 */
public class SparkConfig {
    private String appName;
    private String master;
    private String warehouseDir;
    private Map<String, String> configs;

    public SparkConfig() {
        this.configs = new HashMap<>();
    }

    public SparkConfig(String appName, String master) {
        this();
        this.appName = appName;
        this.master = master;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getMaster() {
        return master;
    }

    public void setMaster(String master) {
        this.master = master;
    }

    public String getWarehouseDir() {
        return warehouseDir;
    }

    public void setWarehouseDir(String warehouseDir) {
        this.warehouseDir = warehouseDir;
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
