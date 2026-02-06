@echo off
REM BigData Java 服务启动脚本 (Windows)

echo Starting BigData Java Service...

REM 检查 Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Java is not installed or not in PATH
    exit /b 1
)

REM 检查 Maven
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Maven is not installed or not in PATH
    exit /b 1
)

REM 进入项目目录
cd /d "%~dp0"

echo Building project...
call mvn clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    exit /b 1
)

echo Starting Spring Boot application...
call mvn spring-boot:run
