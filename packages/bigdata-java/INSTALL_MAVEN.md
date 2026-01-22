# 安装 Maven

本项目需要 Apache Maven 来构建和运行。以下是不同操作系统的安装方法：

## macOS

### 方法 1: 使用 Homebrew（推荐）

```bash
# 安装 Maven
brew install maven

# 验证安装
mvn --version
```

### 方法 2: 使用 SDKMAN

```bash
# 如果已安装 SDKMAN
sdk install maven

# 设置为默认版本
sdk default maven
```

### 方法 3: 手动安装

1. 下载 Maven：https://maven.apache.org/download.cgi
2. 解压到 `/usr/local/` 或 `~/Applications/`
3. 设置环境变量（添加到 `~/.zshrc` 或 `~/.bash_profile`）：
```bash
export M2_HOME=/path/to/maven
export PATH="$M2_HOME/bin:$PATH"
```

## Linux (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt update

# 安装 Maven
sudo apt install maven

# 验证安装
mvn --version
```

## Linux (CentOS/RHEL)

```bash
# 安装 Maven
sudo yum install maven

# 或使用 dnf (Fedora/CentOS 8+)
sudo dnf install maven

# 验证安装
mvn --version
```

## Windows

### 方法 1: 使用 Chocolatey

```powershell
# 安装 Maven
choco install maven
```

### 方法 2: 手动安装

1. 下载 Maven：https://maven.apache.org/download.cgi
2. 解压到 `C:\Program Files\Apache\maven`
3. 设置环境变量：
   - `M2_HOME` = `C:\Program Files\Apache\maven`
   - 添加到 `PATH`: `%M2_HOME%\bin`

## 使用 Maven Wrapper（推荐）

如果不想全局安装 Maven，可以使用 Maven Wrapper。项目可以包含 `mvnw`（Linux/macOS）和 `mvnw.cmd`（Windows）脚本。

### 设置 Maven Wrapper

```bash
cd packages/bigdata-java

# 如果项目还没有 Maven Wrapper，可以添加它
mvn wrapper:wrapper
```

### 使用 Maven Wrapper

**Linux/macOS:**
```bash
./mvnw clean package
./mvnw spring-boot:run
```

**Windows:**
```cmd
mvnw.cmd clean package
mvnw.cmd spring-boot:run
```

## 验证安装

安装完成后，运行以下命令验证：

```bash
mvn --version
```

应该看到类似以下输出：
```
Apache Maven 3.9.x
Maven home: /path/to/maven
Java version: 17.0.x
...
```

## 故障排除

### 问题：mvn 命令未找到

**解决方案：**
1. 检查 Maven 是否已安装：`which mvn` 或 `where mvn`（Windows）
2. 检查 PATH 环境变量
3. 重新打开终端或重新加载配置

### 问题：Maven 使用错误的 Java 版本

**解决方案：**
设置 `JAVA_HOME` 环境变量：
```bash
export JAVA_HOME=/path/to/java17
```

### 问题：Maven 下载依赖很慢

**解决方案：**
配置 Maven 使用国内镜像（编辑 `~/.m2/settings.xml`）：
```xml
<mirrors>
  <mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Aliyun Maven</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

## 快速安装（macOS）

```bash
# 使用 Homebrew 一键安装
brew install maven

# 验证
mvn --version
```

## 需要帮助？

如果遇到问题，请检查：
1. `mvn --version` 输出
2. `echo $M2_HOME` 输出（如果设置了）
3. `which mvn` 输出

确保 Maven 在 PATH 中，并且使用正确的 Java 版本。
