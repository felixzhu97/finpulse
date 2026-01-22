# 安装 Java 17

本项目需要 Java 17 或更高版本。以下是不同操作系统的安装方法：

## macOS

### 方法 1: 使用 Homebrew（推荐）

```bash
# 安装 Java 17
brew install openjdk@17

# 设置 JAVA_HOME（添加到 ~/.zshrc 或 ~/.bash_profile）
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 验证安装
java -version
```

### 方法 2: 使用 SDKMAN

```bash
# 安装 SDKMAN
curl -s "https://get.sdkman.io" | bash

# 安装 Java 17
sdk install java 17.0.9-tem

# 设置为默认版本
sdk default java 17.0.9-tem
```

### 方法 3: 手动下载

1. 访问 [Adoptium](https://adoptium.net/)
2. 选择 Java 17 (LTS)
3. 下载 macOS 版本
4. 安装并设置 JAVA_HOME

## Linux (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt update

# 安装 OpenJDK 17
sudo apt install openjdk-17-jdk

# 验证安装
java -version

# 设置默认 Java 版本（如果有多个版本）
sudo update-alternatives --config java
```

## Linux (CentOS/RHEL)

```bash
# 安装 OpenJDK 17
sudo yum install java-17-openjdk-devel

# 或使用 dnf (Fedora/CentOS 8+)
sudo dnf install java-17-openjdk-devel

# 验证安装
java -version
```

## Windows

### 方法 1: 使用 Chocolatey

```powershell
# 安装 Chocolatey（如果未安装）
# 然后安装 Java 17
choco install openjdk17
```

### 方法 2: 手动下载

1. 访问 [Adoptium](https://adoptium.net/)
2. 选择 Java 17 (LTS)
3. 下载 Windows x64 安装程序
4. 运行安装程序
5. 设置环境变量 `JAVA_HOME` 指向安装目录

## 验证安装

安装完成后，运行以下命令验证：

```bash
java -version
```

应该看到类似以下输出：
```
openjdk version "17.0.x" ...
OpenJDK Runtime Environment ...
OpenJDK 64-Bit Server VM ...
```

## 切换 Java 版本（如果有多个版本）

### macOS

```bash
# 查看所有已安装的 Java 版本
/usr/libexec/java_home -V

# 临时使用 Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# 永久设置（添加到 ~/.zshrc）
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
```

### Linux

```bash
# 查看所有已安装的 Java 版本
sudo update-alternatives --list java

# 切换 Java 版本
sudo update-alternatives --config java
```

## 故障排除

### 问题：java -version 仍然显示旧版本

**解决方案：**
1. 检查 PATH 环境变量
2. 确保新安装的 Java 在 PATH 的前面
3. 重新打开终端或重新加载配置

### 问题：Maven 仍然使用旧版本 Java

**解决方案：**
设置 `JAVA_HOME` 环境变量：
```bash
export JAVA_HOME=/path/to/java17
```

或在 Maven 配置中指定：
```bash
mvn -version  # 检查 Maven 使用的 Java 版本
```

## 需要帮助？

如果遇到问题，请检查：
1. `java -version` 输出
2. `echo $JAVA_HOME` 输出
3. `which java` 输出

确保所有命令都指向 Java 17 或更高版本。
