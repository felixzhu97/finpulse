package com.fintech.bigdata.service;

import com.fintech.bigdata.spark.SparkConfig;
import com.fintech.bigdata.spark.SparkJobExecutor;
import com.fintech.bigdata.spark.SparkSessionManager;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Spark 服务层
 * 提供 Spark 相关的业务逻辑
 */
@Service
public class SparkService {
    private static final Logger logger = LoggerFactory.getLogger(SparkService.class);

    @Autowired
    private SparkSessionManager sessionManager;

    @Autowired
    private SparkJobExecutor jobExecutor;

    /**
     * 创建 SparkSession
     */
    public String createSession(SparkConfig config) {
        try {
            String sessionId = UUID.randomUUID().toString();
            SparkSession session = sessionManager.createSession(sessionId, config);
            return session.sparkContext().applicationId();
        } catch (Exception e) {
            logger.error("Error creating Spark session", e);
            throw new RuntimeException("Failed to create Spark session: " + e.getMessage(), e);
        }
    }

    /**
     * 执行 SQL 查询
     */
    public List<Row> executeSQL(String sessionId, String sql) {
        Dataset<Row> result = sessionManager.executeSQL(sessionId, sql);
        return result.collectAsList();
    }

    /**
     * 提交批处理作业
     */
    public String submitJob(String sessionId, String jobName, Map<String, Object> jobConfig) {
        SparkSession session = sessionManager.getSession(sessionId);
        
        return jobExecutor.submitBatchJob(session, jobName, () -> {
            // 作业执行逻辑
            logger.info("Executing job: {}", jobName);
        });
    }

    /**
     * 获取作业状态
     */
    public String getJobStatus(String jobId) {
        // 简化实现，实际应该查询 Spark 集群状态
        logger.debug("Getting status for job: {}", jobId);
        return "RUNNING";
    }

    /**
     * 关闭会话
     */
    public void closeSession(String sessionId) {
        sessionManager.closeSession(sessionId);
    }
}
