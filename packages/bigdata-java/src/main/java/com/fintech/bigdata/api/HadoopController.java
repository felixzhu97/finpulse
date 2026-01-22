package com.fintech.bigdata.api;

import com.fintech.bigdata.api.dto.HDFSFileRequest;
import com.fintech.bigdata.hadoop.HadoopConfig;
import com.fintech.bigdata.service.HadoopService;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.yarn.api.records.ApplicationReport;
import org.apache.hadoop.yarn.api.records.YarnApplicationState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Hadoop REST API 控制器
 */
@RestController
@RequestMapping("/api/v1/hadoop")
public class HadoopController {
    private static final Logger logger = LoggerFactory.getLogger(HadoopController.class);

    @Autowired
    private HadoopService hadoopService;

    /**
     * 初始化 Hadoop 服务
     */
    @PostMapping("/init")
    public ResponseEntity<Map<String, String>> initialize(@RequestBody HadoopConfig config) {
        logger.info("Initializing Hadoop services");
        try {
            hadoopService.initializeHDFS(config);
            hadoopService.initializeYARN(config);
            return ResponseEntity.ok(Map.of("status", "initialized"));
        } catch (Exception e) {
            logger.error("Error initializing Hadoop services", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 写入 HDFS 文件
     */
    @PostMapping("/hdfs/write")
    public ResponseEntity<Map<String, String>> writeFile(@RequestBody HDFSFileRequest request) {
        logger.info("Writing file to HDFS: {}", request.getPath());
        try {
            hadoopService.writeHDFSFile(request.getPath(), request.getData());
            return ResponseEntity.ok(Map.of("status", "success", "path", request.getPath()));
        } catch (Exception e) {
            logger.error("Error writing HDFS file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 读取 HDFS 文件
     */
    @GetMapping("/hdfs/read")
    public ResponseEntity<byte[]> readFile(@RequestParam String path) {
        logger.info("Reading file from HDFS: {}", path);
        try {
            byte[] data = hadoopService.readHDFSFile(path);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", path);
            return ResponseEntity.ok().headers(headers).body(data);
        } catch (Exception e) {
            logger.error("Error reading HDFS file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 列出 HDFS 目录
     */
    @GetMapping("/hdfs/list")
    public ResponseEntity<List<Map<String, Object>>> listDirectory(@RequestParam String path) {
        logger.info("Listing HDFS directory: {}", path);
        try {
            List<FileStatus> statuses = hadoopService.listHDFSDirectory(path);
            List<Map<String, Object>> result = statuses.stream()
                    .map(status -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("path", status.getPath().toString());
                        map.put("isDirectory", status.isDirectory());
                        map.put("length", status.getLen());
                        map.put("modificationTime", status.getModificationTime());
                        return map;
                    })
                    .toList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error listing HDFS directory", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取 HDFS 文件状态
     */
    @GetMapping("/hdfs/status")
    public ResponseEntity<Map<String, Object>> getFileStatus(@RequestParam String path) {
        logger.debug("Getting HDFS file status: {}", path);
        try {
            FileStatus status = hadoopService.getHDFSFileStatus(path);
            Map<String, Object> result = new HashMap<>();
            result.put("path", status.getPath().toString());
            result.put("isDirectory", status.isDirectory());
            result.put("length", status.getLen());
            result.put("modificationTime", status.getModificationTime());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error getting HDFS file status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 删除 HDFS 文件
     */
    @DeleteMapping("/hdfs/delete")
    public ResponseEntity<Map<String, String>> deleteFile(
            @RequestParam String path,
            @RequestParam(defaultValue = "false") boolean recursive) {
        logger.info("Deleting HDFS file: {} (recursive: {})", path, recursive);
        try {
            boolean deleted = hadoopService.deleteHDFSFile(path, recursive);
            return ResponseEntity.ok(Map.of("status", deleted ? "deleted" : "not_found", "path", path));
        } catch (Exception e) {
            logger.error("Error deleting HDFS file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 创建 HDFS 目录
     */
    @PostMapping("/hdfs/mkdir")
    public ResponseEntity<Map<String, String>> createDirectory(@RequestParam String path) {
        logger.info("Creating HDFS directory: {}", path);
        try {
            boolean created = hadoopService.createHDFSDirectory(path);
            return ResponseEntity.ok(Map.of("status", created ? "created" : "exists", "path", path));
        } catch (Exception e) {
            logger.error("Error creating HDFS directory", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 列出 YARN 应用程序
     */
    @GetMapping("/yarn/applications")
    public ResponseEntity<List<Map<String, Object>>> listApplications(
            @RequestParam(required = false) String state) {
        logger.debug("Listing YARN applications");
        try {
            YarnApplicationState appState = state != null 
                ? YarnApplicationState.valueOf(state.toUpperCase()) 
                : null;
            
            List<ApplicationReport> applications = appState != null
                ? hadoopService.listYARNApplications(appState)
                : hadoopService.listYARNApplications();
            
            List<Map<String, Object>> result = applications.stream()
                    .map(app -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("applicationId", app.getApplicationId().toString());
                        map.put("name", app.getName());
                        map.put("state", app.getYarnApplicationState().toString());
                        map.put("startTime", app.getStartTime());
                        return map;
                    })
                    .toList();
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error listing YARN applications", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取 YARN 集群指标
     */
    @GetMapping("/yarn/metrics")
    public ResponseEntity<Map<String, Object>> getClusterMetrics() {
        logger.debug("Getting YARN cluster metrics");
        try {
            Map<String, Object> metrics = hadoopService.getYARNClusterMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            logger.error("Error getting YARN cluster metrics", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
