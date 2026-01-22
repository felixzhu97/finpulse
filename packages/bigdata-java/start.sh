#!/bin/bash

# BigData Java 服务启动脚本

echo "Starting BigData Java Service..."

# 检查 Java 版本
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    exit 1
fi

# 获取 Java 版本号
JAVA_VERSION_STRING=$(java -version 2>&1 | head -n 1)
JAVA_VERSION_FULL=$(echo "$JAVA_VERSION_STRING" | awk -F'"' '{print $2}')

# 处理不同版本的 Java 版本号格式
# Java 8 及以下: "1.8.0_xxx"
# Java 9+: "17.0.x", "21.0.x" 等
JAVA_MAJOR=0
if [[ "$JAVA_VERSION_FULL" =~ ^1\. ]]; then
    # Java 8 及以下版本
    JAVA_MAJOR=$(echo "$JAVA_VERSION_FULL" | cut -d'.' -f2)
else
    # Java 9+ 版本
    JAVA_MAJOR=$(echo "$JAVA_VERSION_FULL" | cut -d'.' -f1)
fi

# 检查是否满足 Java 17+ 要求
if [ "$JAVA_MAJOR" -lt 17 ]; then
    echo "Error: Java 17 or higher is required."
    echo "Current version: $JAVA_VERSION_FULL"
    echo ""
    echo "Please install Java 17 or higher:"
    echo "  - macOS: brew install openjdk@17"
    echo "  - Linux: sudo apt install openjdk-17-jdk"
    echo "  - Or download from: https://adoptium.net/"
    echo ""
    # 在 macOS 上检查是否有其他 Java 版本
    if [[ "$OSTYPE" == "darwin"* ]] && command -v /usr/libexec/java_home &> /dev/null; then
        echo "Available Java versions on this system:"
        /usr/libexec/java_home -V 2>&1 | grep -E "Java|jdk" | head -5
        echo ""
        echo "To use a specific Java version, set JAVA_HOME:"
        echo "  export JAVA_HOME=\$(/usr/libexec/java_home -v 17)"
    fi
    exit 1
fi

echo "✓ Java version: $JAVA_VERSION_FULL"

# 检查 Maven
MVN_CMD=""
if [ -f "./mvnw" ]; then
    # 优先使用 Maven Wrapper
    MVN_CMD="./mvnw"
    echo "✓ Using Maven Wrapper (mvnw)"
elif command -v mvn &> /dev/null; then
    # 使用系统 Maven
    MVN_CMD="mvn"
    echo "✓ Maven found"
else
    echo "Error: Maven is not installed or not in PATH"
    echo ""
    echo "Please install Maven using one of the following methods:"
    echo ""
    echo "  Quick install (macOS with Homebrew):"
    echo "    brew install maven"
    echo ""
    echo "  Quick install (Linux):"
    echo "    sudo apt install maven    # Ubuntu/Debian"
    echo "    sudo yum install maven    # CentOS/RHEL"
    echo ""
    echo "  Or download from: https://maven.apache.org/download.cgi"
    echo ""
    echo "  See INSTALL_MAVEN.md for detailed instructions."
    echo ""
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "Building project..."
$MVN_CMD clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

echo "Starting Spring Boot application..."
$MVN_CMD spring-boot:run
