package com.fintech.bigdata.hadoop;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import org.apache.hadoop.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * HDFS 服务
 * 提供 HDFS 文件系统操作
 */
public class HDFSService {
    private static final Logger logger = LoggerFactory.getLogger(HDFSService.class);
    private final FileSystem fileSystem;
    private final Configuration configuration;

    public HDFSService(Configuration conf) throws IOException {
        this.configuration = conf;
        this.fileSystem = FileSystem.get(conf);
    }

    public HDFSService(HadoopConfig config) throws IOException {
        this.configuration = createConfiguration(config);
        this.fileSystem = FileSystem.get(this.configuration);
    }

    private Configuration createConfiguration(HadoopConfig config) {
        Configuration conf = new Configuration();
        
        if (config.getDefaultFS() != null) {
            conf.set("fs.defaultFS", config.getDefaultFS());
        }

        if (config.getUserName() != null) {
            System.setProperty("HADOOP_USER_NAME", config.getUserName());
        }

        // 添加自定义配置
        for (Map.Entry<String, String> entry : config.getConfigs().entrySet()) {
            conf.set(entry.getKey(), entry.getValue());
        }

        return conf;
    }

    /**
     * 读取文件
     */
    public byte[] readFile(String path) throws IOException {
        logger.debug("Reading file from HDFS: {}", path);
        Path hdfsPath = new Path(path);
        
        if (!fileSystem.exists(hdfsPath)) {
            throw new IOException("File not found: " + path);
        }

        try (FSDataInputStream in = fileSystem.open(hdfsPath)) {
            return IOUtils.readFullyToByteArray(in);
        }
    }

    /**
     * 写入文件
     */
    public void writeFile(String path, byte[] data) throws IOException {
        logger.debug("Writing file to HDFS: {}", path);
        Path hdfsPath = new Path(path);
        
        // 确保父目录存在
        Path parent = hdfsPath.getParent();
        if (parent != null && !fileSystem.exists(parent)) {
            fileSystem.mkdirs(parent);
        }

        try (FSDataOutputStream out = fileSystem.create(hdfsPath, true)) {
            out.write(data);
        }
    }

    /**
     * 追加文件
     */
    public void appendFile(String path, byte[] data) throws IOException {
        logger.debug("Appending to file in HDFS: {}", path);
        Path hdfsPath = new Path(path);
        
        try (FSDataOutputStream out = fileSystem.append(hdfsPath)) {
            out.write(data);
        }
    }

    /**
     * 删除文件或目录
     */
    public boolean deleteFile(String path, boolean recursive) throws IOException {
        logger.debug("Deleting from HDFS: {} (recursive: {})", path, recursive);
        Path hdfsPath = new Path(path);
        return fileSystem.delete(hdfsPath, recursive);
    }

    /**
     * 列出目录内容
     */
    public List<FileStatus> listDirectory(String path) throws IOException {
        logger.debug("Listing directory in HDFS: {}", path);
        Path hdfsPath = new Path(path);
        
        if (!fileSystem.exists(hdfsPath)) {
            throw new IOException("Directory not found: " + path);
        }

        FileStatus[] statuses = fileSystem.listStatus(hdfsPath);
        List<FileStatus> result = new ArrayList<>();
        for (FileStatus status : statuses) {
            result.add(status);
        }
        return result;
    }

    /**
     * 获取文件状态
     */
    public FileStatus getFileStatus(String path) throws IOException {
        logger.debug("Getting file status from HDFS: {}", path);
        Path hdfsPath = new Path(path);
        return fileSystem.getFileStatus(hdfsPath);
    }

    /**
     * 创建目录
     */
    public boolean createDirectory(String path) throws IOException {
        logger.debug("Creating directory in HDFS: {}", path);
        Path hdfsPath = new Path(path);
        return fileSystem.mkdirs(hdfsPath);
    }

    /**
     * 重命名文件或目录
     */
    public boolean renameFile(String srcPath, String dstPath) throws IOException {
        logger.debug("Renaming in HDFS: {} -> {}", srcPath, dstPath);
        Path src = new Path(srcPath);
        Path dst = new Path(dstPath);
        return fileSystem.rename(src, dst);
    }

    /**
     * 检查文件或目录是否存在
     */
    public boolean exists(String path) throws IOException {
        Path hdfsPath = new Path(path);
        return fileSystem.exists(hdfsPath);
    }

    /**
     * 关闭文件系统
     */
    public void close() throws IOException {
        if (fileSystem != null) {
            fileSystem.close();
        }
    }
}
