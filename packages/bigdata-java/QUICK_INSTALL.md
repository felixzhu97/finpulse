# 快速安装指南

## 一键安装所有依赖（macOS）

```bash
# 安装 Java 17
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# 安装 Maven
brew install maven

# 验证安装
java -version
mvn --version
```

## 启动服务器

安装完成后：

```bash
cd packages/bigdata-java
./start.sh
```

## 如果遇到问题

1. **Java 版本问题**：查看 `INSTALL_JAVA.md`
2. **Maven 安装问题**：查看 `INSTALL_MAVEN.md`
3. **其他问题**：查看 `README.md` 或 `QUICKSTART.md`
 