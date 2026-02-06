package com.fintech.bigdata.flink;

import org.apache.flink.api.common.JobExecutionResult;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.TableEnvironment;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Flink 环境管理器
 * 负责创建和管理 Flink 执行环境
 */
@Component
public class FlinkEnvironmentManager {
    private static final Logger logger = LoggerFactory.getLogger(FlinkEnvironmentManager.class);
    private final Map<String, StreamExecutionEnvironment> environments = new ConcurrentHashMap<>();
    private final Map<String, StreamTableEnvironment> tableEnvironments = new ConcurrentHashMap<>();

    /**
     * 创建 StreamExecutionEnvironment
     */
    public StreamExecutionEnvironment createStreamEnvironment(String envId, FlinkConfig config) {
        logger.info("Creating Flink StreamExecutionEnvironment with id: {}", envId);

        Configuration flinkConfig = new Configuration();
        
        // 设置并行度
        if (config.getParallelism() != null) {
            flinkConfig.setString("parallelism.default", config.getParallelism().toString());
        }

        // 设置检查点
        if (config.getCheckpointInterval() != null) {
            flinkConfig.setString("execution.checkpointing.interval", config.getCheckpointInterval().toString());
        }

        if (config.getCheckpointPath() != null) {
            flinkConfig.setString("state.checkpoints.dir", config.getCheckpointPath());
        }

        // 添加自定义配置
        for (Map.Entry<String, String> entry : config.getConfigs().entrySet()) {
            flinkConfig.setString(entry.getKey(), entry.getValue());
        }

        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment(flinkConfig);
        
        if (config.getParallelism() != null) {
            env.setParallelism(config.getParallelism());
        }

        environments.put(envId, env);
        logger.info("Flink StreamExecutionEnvironment created successfully: {}", envId);
        return env;
    }

    /**
     * 获取 StreamExecutionEnvironment
     */
    public StreamExecutionEnvironment getStreamEnvironment(String envId) {
        StreamExecutionEnvironment env = environments.get(envId);
        if (env == null) {
            throw new IllegalArgumentException("StreamExecutionEnvironment not found: " + envId);
        }
        return env;
    }

    /**
     * 创建 StreamTableEnvironment
     */
    public StreamTableEnvironment createTableEnvironment(String envId, StreamExecutionEnvironment streamEnv) {
        logger.debug("Creating StreamTableEnvironment for env: {}", envId);
        
        EnvironmentSettings settings = EnvironmentSettings.newInstance()
                .inStreamingMode()
                .build();
        
        StreamTableEnvironment tableEnv = StreamTableEnvironment.create(streamEnv, settings);
        tableEnvironments.put(envId, tableEnv);
        
        return tableEnv;
    }

    /**
     * 获取 StreamTableEnvironment
     */
    public StreamTableEnvironment getTableEnvironment(String envId) {
        StreamTableEnvironment tableEnv = tableEnvironments.get(envId);
        if (tableEnv == null) {
            throw new IllegalArgumentException("StreamTableEnvironment not found: " + envId);
        }
        return tableEnv;
    }

    /**
     * 执行作业
     */
    public JobExecutionResult execute(String envId, String jobName) throws Exception {
        StreamExecutionEnvironment env = getStreamEnvironment(envId);
        logger.info("Executing Flink job: {}", jobName);
        return env.execute(jobName);
    }

    /**
     * 关闭环境
     */
    public void closeEnvironment(String envId) {
        StreamExecutionEnvironment env = environments.remove(envId);
        if (env != null) {
            logger.info("Closing Flink environment: {}", envId);
            try {
                env.close();
            } catch (Exception e) {
                logger.warn("Error closing Flink environment", e);
            }
        }
        tableEnvironments.remove(envId);
    }

    /**
     * 关闭所有环境
     */
    public void closeAllEnvironments() {
        logger.info("Closing all Flink environments");
        for (Map.Entry<String, StreamExecutionEnvironment> entry : environments.entrySet()) {
            try {
                entry.getValue().close();
            } catch (Exception e) {
                logger.warn("Error closing Flink environment: {}", entry.getKey(), e);
            }
        }
        environments.clear();
        tableEnvironments.clear();
    }
}
