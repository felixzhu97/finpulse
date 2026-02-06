# 快速启动指南

## 启动服务器

### 方法 1: 使用启动脚本（推荐）

**Linux/macOS:**
```bash
cd services/bigdata-java
./start.sh
```

**Windows:**
```cmd
cd services\bigdata-java
start.bat
```

### 方法 2: 使用 Maven

```bash
cd services/bigdata-java
mvn spring-boot:run
```

### 方法 3: 构建并运行 JAR

```bash
cd services/bigdata-java
mvn clean package
java -jar target/bigdata-java-0.1.0.jar
```

## 验证服务

服务启动后，访问以下端点验证：

1. **健康检查**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

2. **查看测试数据**
   ```bash
   curl "http://localhost:8080/api/v1/hadoop/hdfs/list?path=/tmp/bigdata-test"
   ```

## 测试数据

服务器启动时会自动创建以下测试数据：

- `/tmp/bigdata-test/sample_data.csv` - CSV 格式示例数据（产品信息）
- `/tmp/bigdata-test/sample_data.json` - JSON 格式示例数据（交易记录）
- `/tmp/bigdata-test/sample_data.txt` - 文本格式示例数据

## 使用 TypeScript 客户端测试

```bash
cd packages/bigdata
pnpm install
pnpm test:client
```

## 常见问题

### 端口被占用

如果 8080 端口被占用，可以修改 `application.properties` 中的 `server.port` 配置。

### Hadoop 初始化失败

如果看到 Hadoop 初始化失败的警告，这是正常的。服务仍然可以运行，只是 HDFS 功能不可用。要使用 HDFS，需要配置正确的 Hadoop 集群地址。

### Java 版本问题

确保使用 Java 17 或更高版本：
```bash
java -version
```
