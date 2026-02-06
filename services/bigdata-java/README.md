# BigData Java Service

BigData 集成服务的 Java 后端，提供 Spark、Flink 和 Hadoop 的 REST API。

## 功能

- **Spark 集成**：支持 SparkSession 管理、SQL 查询、批处理作业
- **Flink 集成**：支持流处理作业、Table API、集群管理
- **Hadoop 集成**：支持 HDFS 文件操作、YARN 应用管理

## 环境要求

- Java 17+
- Maven 3.6+

## 快速开始

### 启动服务

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

**或使用 Maven 直接启动:**
```bash
mvn spring-boot:run
```

### 构建 JAR 文件

```bash
mvn clean package
java -jar target/bigdata-java-0.1.0.jar
```

## API 端点

服务启动后，默认运行在 `http://localhost:8080`

### 健康检查
- `GET /api/v1/health` - 服务健康状态
- `GET /api/v1/health/ready` - 就绪状态

### Spark API
- `POST /api/v1/spark/sessions` - 创建 SparkSession
- `POST /api/v1/spark/sessions/{id}/sql` - 执行 SQL
- `POST /api/v1/spark/jobs` - 提交批处理作业
- `GET /api/v1/spark/jobs/{id}` - 查询作业状态
- `DELETE /api/v1/spark/sessions/{id}` - 关闭会话

### Flink API
- `POST /api/v1/flink/jobs` - 提交流处理作业
- `GET /api/v1/flink/jobs/{id}` - 查询作业状态
- `POST /api/v1/flink/jobs/{id}/cancel` - 取消作业
- `GET /api/v1/flink/overview` - 集群概览

### Hadoop API
- `POST /api/v1/hadoop/init` - 初始化 Hadoop 服务
- `POST /api/v1/hadoop/hdfs/write` - 写入文件
- `GET /api/v1/hadoop/hdfs/read?path=...` - 读取文件
- `GET /api/v1/hadoop/hdfs/list?path=...` - 列出目录
- `GET /api/v1/hadoop/hdfs/status?path=...` - 获取文件状态
- `DELETE /api/v1/hadoop/hdfs/delete?path=...&recursive=false` - 删除文件
- `POST /api/v1/hadoop/hdfs/mkdir?path=...` - 创建目录
- `GET /api/v1/hadoop/yarn/applications` - 列出 YARN 应用
- `GET /api/v1/hadoop/yarn/metrics` - 获取集群指标

## 测试数据

应用启动时会自动创建测试数据：

- `/tmp/bigdata-test/sample_data.csv` - CSV 格式示例数据
- `/tmp/bigdata-test/sample_data.json` - JSON 格式示例数据
- `/tmp/bigdata-test/sample_data.txt` - 文本格式示例数据

## 配置

配置文件：`src/main/resources/application.properties`

主要配置项：
- `server.port` - 服务端口（默认：8080）
- `spark.default.master` - Spark 主节点（默认：local[*]）
- `flink.default.parallelism` - Flink 并行度（默认：4）
- `hadoop.default.fs.defaultFS` - Hadoop 文件系统（默认：file:///）

## 开发

### 运行测试
```bash
mvn test
```

### 代码检查
```bash
mvn checkstyle:check
```

## 注意事项

1. Spark、Flink 和 Hadoop 的完整功能需要相应的集群环境
2. 本地模式使用本地文件系统，适合开发和测试
3. 生产环境需要配置正确的集群地址和认证信息
