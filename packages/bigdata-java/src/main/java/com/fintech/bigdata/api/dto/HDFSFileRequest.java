package com.fintech.bigdata.api.dto;

/**
 * HDFS 文件操作请求
 */
public class HDFSFileRequest {
    private String path;
    private byte[] data;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
