package com.fintech.bigdata.spark;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SparkSession 管理器
 * 负责创建和管理 SparkSession 实例
 */
@Component
public class SparkSessionManager {
    private static final Logger logger = LoggerFactory.getLogger(SparkSessionManager.class);
    private final Map<String, SparkSession> sessions = new ConcurrentHashMap<>();

    /**
     * 创建 SparkSession
     */
    public SparkSession createSession(String sessionId, SparkConfig config) {
        logger.info("Creating SparkSession with id: {}, appName: {}", sessionId, config.getAppName());

        SparkSession.Builder builder = SparkSession.builder()
                .appName(config.getAppName() != null ? config.getAppName() : "fintech-bigdata");

        if (config.getMaster() != null) {
            builder.master(config.getMaster());
        }

        if (config.getWarehouseDir() != null) {
            builder.config("spark.sql.warehouse.dir", config.getWarehouseDir());
        }

        // 添加自定义配置
        for (Map.Entry<String, String> entry : config.getConfigs().entrySet()) {
            builder.config(entry.getKey(), entry.getValue());
        }

        SparkSession session = builder.getOrCreate();
        sessions.put(sessionId, session);

        logger.info("SparkSession created successfully: {}", session.sparkContext().applicationId());
        return session;
    }

    /**
     * 获取 SparkSession
     */
    public SparkSession getSession(String sessionId) {
        SparkSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("SparkSession not found: " + sessionId);
        }
        return session;
    }

    /**
     * 执行 SQL 查询
     */
    public Dataset<Row> executeSQL(String sessionId, String sql) {
        logger.debug("Executing SQL on session {}: {}", sessionId, sql);
        SparkSession session = getSession(sessionId);
        return session.sql(sql);
    }

    /**
     * 关闭 SparkSession
     */
    public void closeSession(String sessionId) {
        SparkSession session = sessions.remove(sessionId);
        if (session != null) {
            logger.info("Closing SparkSession: {}", sessionId);
            session.stop();
        }
    }

    /**
     * 关闭所有 SparkSession
     */
    public void closeAllSessions() {
        logger.info("Closing all SparkSessions");
        for (Map.Entry<String, SparkSession> entry : sessions.entrySet()) {
            entry.getValue().stop();
        }
        sessions.clear();
    }
}
