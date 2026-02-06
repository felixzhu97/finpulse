package com.fintech.bigdata.service;

import com.fintech.bigdata.hadoop.HDFSService;
import com.fintech.bigdata.hadoop.HadoopConfig;
import com.fintech.bigdata.hadoop.YARNService;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.yarn.api.records.ApplicationId;
import org.apache.hadoop.yarn.api.records.ApplicationReport;
import org.apache.hadoop.yarn.api.records.YarnApplicationState;
import org.apache.hadoop.yarn.exceptions.YarnException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

/**
 * Hadoop 服务层
 * 提供 Hadoop 相关的业务逻辑
 */
@Service
public class HadoopService {
    private static final Logger logger = LoggerFactory.getLogger(HadoopService.class);

    private HDFSService hdfsService;
    private YARNService yarnService;

    /**
     * 初始化 HDFS 服务
     */
    public void initializeHDFS(HadoopConfig config) throws IOException {
        logger.info("Initializing HDFS service");
        this.hdfsService = new HDFSService(config);
    }

    /**
     * 初始化 YARN 服务
     */
    public void initializeYARN(HadoopConfig config) {
        logger.info("Initializing YARN service");
        this.yarnService = new YARNService(config);
    }

    /**
     * 读取 HDFS 文件
     */
    public byte[] readHDFSFile(String path) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        return hdfsService.readFile(path);
    }

    /**
     * 写入 HDFS 文件
     */
    public void writeHDFSFile(String path, byte[] data) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        hdfsService.writeFile(path, data);
    }

    /**
     * 列出 HDFS 目录
     */
    public List<FileStatus> listHDFSDirectory(String path) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        return hdfsService.listDirectory(path);
    }

    /**
     * 获取 HDFS 文件状态
     */
    public FileStatus getHDFSFileStatus(String path) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        return hdfsService.getFileStatus(path);
    }

    /**
     * 删除 HDFS 文件
     */
    public boolean deleteHDFSFile(String path, boolean recursive) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        return hdfsService.deleteFile(path, recursive);
    }

    /**
     * 创建 HDFS 目录
     */
    public boolean createHDFSDirectory(String path) throws IOException {
        if (hdfsService == null) {
            throw new IllegalStateException("HDFS service not initialized");
        }
        return hdfsService.createDirectory(path);
    }

    /**
     * 获取 YARN 集群指标
     */
    public Map<String, Object> getYARNClusterMetrics() 
            throws IOException, YarnException {
        if (yarnService == null) {
            throw new IllegalStateException("YARN service not initialized");
        }
        // 使用 getNodeReports() 来获取集群信息
        var nodeReports = yarnService.getNodeReports();
        int totalNodes = nodeReports.size();
        long activeNodes = nodeReports.stream()
            .filter(report -> report.getNodeState() == org.apache.hadoop.yarn.api.records.NodeState.RUNNING)
            .count();
        
        return Map.of(
            "numNodeManagers", totalNodes,
            "numActiveNodeManagers", (int) activeNodes,
            "numDecommissionedNodeManagers", totalNodes - (int) activeNodes
        );
    }

    /**
     * 列出 YARN 应用程序
     */
    public List<ApplicationReport> listYARNApplications(YarnApplicationState... states) 
            throws IOException, YarnException {
        if (yarnService == null) {
            throw new IllegalStateException("YARN service not initialized");
        }
        EnumSet<YarnApplicationState> stateSet = states.length > 0 
            ? EnumSet.of(states[0], states) 
            : EnumSet.allOf(YarnApplicationState.class);
        return yarnService.listApplications(stateSet);
    }

    /**
     * 终止 YARN 应用程序
     */
    public void killYARNApplication(ApplicationId applicationId) 
            throws IOException, YarnException {
        if (yarnService == null) {
            throw new IllegalStateException("YARN service not initialized");
        }
        yarnService.killApplication(applicationId);
    }

    /**
     * 关闭服务
     */
    public void close() throws IOException {
        if (hdfsService != null) {
            hdfsService.close();
        }
        if (yarnService != null) {
            yarnService.close();
        }
    }
}
