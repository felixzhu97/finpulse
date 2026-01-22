package com.fintech.bigdata;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * BigData 集成服务主应用
 * 提供 Spark、Flink 和 Hadoop 的 REST API 服务
 */
@SpringBootApplication
public class BigDataApplication {
    public static void main(String[] args) {
        SpringApplication.run(BigDataApplication.class, args);
    }
}
