package com.fintech.bigdata.config;

import com.fintech.bigdata.hadoop.HadoopConfig;
import com.fintech.bigdata.service.HadoopService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;

/**
 * 数据初始化器
 * 在应用启动时创建测试数据
 */
@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private HadoopService hadoopService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing test data...");
        
        // 使用 Java 标准文件 API 创建测试数据（不依赖 Hadoop）
        // 这样可以避免 Java 25+ 的安全限制问题
        try {
            String testDir = "/tmp/bigdata-test";
            java.io.File dir = new java.io.File(testDir);
            if (!dir.exists()) {
                dir.mkdirs();
                logger.info("Created test directory: {}", testDir);
            }
            
            // 创建测试数据文件
            createTestDataFilesWithJavaIO(testDir);
            
            logger.info("Test data initialization completed successfully");
            
            // 尝试初始化 Hadoop（如果可用）
            try {
                HadoopConfig hadoopConfig = new HadoopConfig();
                hadoopConfig.setDefaultFS("file:///");
                hadoopConfig.setUserName(System.getProperty("user.name"));
                hadoopConfig.setConfigs(new HashMap<>());
                
                hadoopService.initializeHDFS(hadoopConfig);
                logger.info("HDFS service initialized (optional)");
            } catch (Exception e) {
                logger.debug("HDFS service initialization skipped (not critical): {}", e.getMessage());
            }
        } catch (Exception e) {
            logger.warn("Failed to initialize test data: {}", e.getMessage());
            logger.debug("Initialization error details", e);
        }
    }

    private void createTestDataFilesWithJavaIO(String baseDir) throws Exception {
        // 创建示例 CSV 数据
        String csvData = "id,name,value,timestamp\n" +
                "1,Product A,100.50,2024-01-01 10:00:00\n" +
                "2,Product B,250.75,2024-01-01 11:00:00\n" +
                "3,Product C,75.25,2024-01-01 12:00:00\n" +
                "4,Product D,300.00,2024-01-01 13:00:00\n" +
                "5,Product E,150.50,2024-01-01 14:00:00\n";
        
        String csvPath = baseDir + "/sample_data.csv";
        writeFile(csvPath, csvData);
        logger.info("Created test CSV file: {}", csvPath);
        
        // 创建示例 JSON 数据
        String jsonData = "{\n" +
                "  \"transactions\": [\n" +
                "    {\"id\": 1, \"amount\": 100.50, \"type\": \"credit\", \"timestamp\": \"2024-01-01T10:00:00Z\"},\n" +
                "    {\"id\": 2, \"amount\": 250.75, \"type\": \"debit\", \"timestamp\": \"2024-01-01T11:00:00Z\"},\n" +
                "    {\"id\": 3, \"amount\": 75.25, \"type\": \"credit\", \"timestamp\": \"2024-01-01T12:00:00Z\"},\n" +
                "    {\"id\": 4, \"amount\": 300.00, \"type\": \"credit\", \"timestamp\": \"2024-01-01T13:00:00Z\"},\n" +
                "    {\"id\": 5, \"amount\": 150.50, \"type\": \"debit\", \"timestamp\": \"2024-01-01T14:00:00Z\"}\n" +
                "  ]\n" +
                "}";
        
        String jsonPath = baseDir + "/sample_data.json";
        writeFile(jsonPath, jsonData);
        logger.info("Created test JSON file: {}", jsonPath);
        
        // 创建示例文本数据
        String textData = "This is a sample text file for testing.\n" +
                "It contains multiple lines of text.\n" +
                "Line 3: More test data here.\n" +
                "Line 4: Financial data processing test.\n" +
                "Line 5: End of test file.";
        
        String textPath = baseDir + "/sample_data.txt";
        writeFile(textPath, textData);
        logger.info("Created test text file: {}", textPath);
    }
    
    private void writeFile(String path, String content) throws Exception {
        try (java.io.FileWriter writer = new java.io.FileWriter(path, StandardCharsets.UTF_8)) {
            writer.write(content);
        }
    }
}
