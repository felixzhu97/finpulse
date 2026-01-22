package com.fintech.bigdata.api;

import com.fintech.bigdata.api.dto.FlinkJobRequest;
import com.fintech.bigdata.api.dto.JobResponse;
import com.fintech.bigdata.service.FlinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Flink REST API 控制器
 */
@RestController
@RequestMapping("/api/v1/flink")
public class FlinkController {
    private static final Logger logger = LoggerFactory.getLogger(FlinkController.class);

    @Autowired
    private FlinkService flinkService;

    /**
     * 提交流处理作业
     */
    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> submitJob(@RequestBody FlinkJobRequest request) {
        logger.info("Submitting Flink job: {}", request.getJobName());
        try {
            String envId = flinkService.createStreamEnvironment(request.getConfig());
            String jobId = flinkService.submitStreamingJob(envId, request.getJobName());
            JobResponse response = new JobResponse(jobId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error submitting Flink job", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 查询作业状态
     */
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobResponse> getJobStatus(@PathVariable String jobId) {
        logger.debug("Getting status for Flink job: {}", jobId);
        try {
            String status = flinkService.getJobStatus(jobId);
            JobResponse response = new JobResponse(jobId);
            response.setStatus(status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting Flink job status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 取消作业
     */
    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<Void> cancelJob(@PathVariable String jobId) {
        logger.info("Cancelling Flink job: {}", jobId);
        try {
            flinkService.cancelJob(jobId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error cancelling Flink job", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取集群概览
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getClusterOverview() {
        logger.debug("Getting Flink cluster overview");
        try {
            Map<String, Object> overview = flinkService.getClusterOverview();
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            logger.error("Error getting Flink cluster overview", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
