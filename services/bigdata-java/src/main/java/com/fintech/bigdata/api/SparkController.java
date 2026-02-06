package com.fintech.bigdata.api;

import com.fintech.bigdata.api.dto.*;
import com.fintech.bigdata.service.SparkService;
import org.apache.spark.sql.Row;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Spark REST API 控制器
 */
@RestController
@RequestMapping("/api/v1/spark")
public class SparkController {
    private static final Logger logger = LoggerFactory.getLogger(SparkController.class);

    @Autowired
    private SparkService sparkService;

    private final Map<String, String> sessionIdMap = new HashMap<>();

    /**
     * 创建 SparkSession
     */
    @PostMapping("/sessions")
    public ResponseEntity<SparkSessionResponse> createSession(@RequestBody SparkSessionRequest request) {
        logger.info("Creating Spark session");
        try {
            String sessionId = UUID.randomUUID().toString();
            // 先创建 sessionId，然后创建 SparkSession
            if (request.getConfig() == null) {
                request.setConfig(new com.fintech.bigdata.spark.SparkConfig());
            }
            String applicationId = sparkService.createSession(request.getConfig());
            sessionIdMap.put(sessionId, applicationId);
            
            SparkSessionResponse response = new SparkSessionResponse(sessionId, applicationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating Spark session", e);
            // 返回错误详情以便调试
            return ResponseEntity.status(500)
                .body(new SparkSessionResponse("error", "Failed to create session: " + e.getMessage()));
        }
    }

    /**
     * 执行 SQL 查询
     */
    @PostMapping("/sessions/{sessionId}/sql")
    public ResponseEntity<QueryResult> executeSQL(
            @PathVariable String sessionId,
            @RequestBody SQLRequest request) {
        logger.info("Executing SQL on session: {}", sessionId);
        try {
            List<Row> rows = sparkService.executeSQL(sessionId, request.getSql());
            
            // 转换 Row 为 Map
            List<Map<String, Object>> data = rows.stream()
                    .map(row -> {
                        Map<String, Object> map = new HashMap<>();
                        String[] columns = row.schema().fieldNames();
                        for (int i = 0; i < columns.length; i++) {
                            map.put(columns[i], row.get(i));
                        }
                        return map;
                    })
                    .collect(Collectors.toList());
            
            QueryResult result = new QueryResult(data);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error executing SQL", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 提交批处理作业
     */
    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> submitJob(@RequestBody JobRequest request) {
        logger.info("Submitting Spark job: {}", request.getJobName());
        try {
            String sessionId = UUID.randomUUID().toString();
            String jobId = sparkService.submitJob(sessionId, request.getJobName(), request.getConfig());
            JobResponse response = new JobResponse(jobId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error submitting Spark job", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 查询作业状态
     */
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobResponse> getJobStatus(@PathVariable String jobId) {
        logger.debug("Getting status for job: {}", jobId);
        try {
            String status = sparkService.getJobStatus(jobId);
            JobResponse response = new JobResponse(jobId);
            response.setStatus(status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting job status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 关闭会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> closeSession(@PathVariable String sessionId) {
        logger.info("Closing Spark session: {}", sessionId);
        try {
            sparkService.closeSession(sessionId);
            sessionIdMap.remove(sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error closing Spark session", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
