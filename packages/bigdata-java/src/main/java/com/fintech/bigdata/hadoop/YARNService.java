package com.fintech.bigdata.hadoop;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.yarn.api.records.ApplicationId;
import org.apache.hadoop.yarn.api.records.ApplicationReport;
import org.apache.hadoop.yarn.api.records.YarnApplicationState;
import org.apache.hadoop.yarn.client.api.YarnClient;
import org.apache.hadoop.yarn.client.api.YarnClientApplication;
import org.apache.hadoop.yarn.exceptions.YarnException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

/**
 * YARN 服务
 * 提供 YARN 资源管理功能
 */
public class YARNService {
    private static final Logger logger = LoggerFactory.getLogger(YARNService.class);
    private final YarnClient yarnClient;
    private final Configuration configuration;

    public YARNService(Configuration conf) {
        this.configuration = conf;
        this.yarnClient = YarnClient.createYarnClient();
        this.yarnClient.init(conf);
        this.yarnClient.start();
    }

    public YARNService(HadoopConfig config) {
        this.configuration = createConfiguration(config);
        this.yarnClient = YarnClient.createYarnClient();
        this.yarnClient.init(this.configuration);
        this.yarnClient.start();
    }

    private Configuration createConfiguration(HadoopConfig config) {
        Configuration conf = new Configuration();
        
        if (config.getDefaultFS() != null) {
            conf.set("fs.defaultFS", config.getDefaultFS());
        }

        // 添加 YARN 相关配置
        for (Map.Entry<String, String> entry : config.getConfigs().entrySet()) {
            conf.set(entry.getKey(), entry.getValue());
        }

        return conf;
    }

    /**
     * 获取集群节点报告
     * 注意：Hadoop 3.3.6 中 ClusterMetrics 类可能不存在，使用 NodeReport 作为替代
     */
    public List<org.apache.hadoop.yarn.api.records.NodeReport> getNodeReports() 
            throws IOException, YarnException {
        logger.debug("Getting YARN node reports");
        return yarnClient.getNodeReports();
    }

    /**
     * 列出应用程序
     */
    public List<ApplicationReport> listApplications(
            EnumSet<YarnApplicationState> applicationStates) 
            throws IOException, YarnException {
        logger.debug("Listing YARN applications with states: {}", applicationStates);
        return yarnClient.getApplications(applicationStates);
    }

    /**
     * 获取应用程序报告
     */
    public ApplicationReport getApplicationReport(ApplicationId applicationId) 
            throws IOException, YarnException {
        logger.debug("Getting application report for: {}", applicationId);
        return yarnClient.getApplicationReport(applicationId);
    }

    /**
     * 终止应用程序
     */
    public void killApplication(ApplicationId applicationId) 
            throws IOException, YarnException {
        logger.info("Killing YARN application: {}", applicationId);
        yarnClient.killApplication(applicationId);
    }

    /**
     * 创建新的应用程序
     */
    public YarnClientApplication createApplication() 
            throws IOException, YarnException {
        logger.debug("Creating new YARN application");
        return yarnClient.createApplication();
    }

    /**
     * 获取所有应用程序
     */
    public List<ApplicationReport> getAllApplications() 
            throws IOException, YarnException {
        logger.debug("Getting all YARN applications");
        return yarnClient.getApplications();
    }

    /**
     * 关闭 YARN 客户端
     */
    public void close() {
        if (yarnClient != null) {
            yarnClient.stop();
        }
    }
}
