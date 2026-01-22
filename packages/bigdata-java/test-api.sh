#!/bin/bash

# BigData API 测试脚本

BASE_URL="http://localhost:8080"

echo "=== BigData API 测试 ==="
echo ""

# 1. 健康检查
echo "1. 健康检查"
curl -s "$BASE_URL/api/v1/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/v1/health"
echo -e "\n"

# 2. 测试 Spark - 创建会话
echo "2. 创建 Spark 会话"
SPARK_SESSION=$(curl -s -X POST "$BASE_URL/api/v1/spark/sessions" \
  -H "Content-Type: application/json" \
  -d '{"config":{"appName":"test-app","master":"local[*]"}}')
echo "$SPARK_SESSION" | jq '.' 2>/dev/null || echo "$SPARK_SESSION"
SESSION_ID=$(echo "$SPARK_SESSION" | jq -r '.sessionId' 2>/dev/null)
echo -e "\n"

# 3. 测试 Flink - 获取集群概览
echo "3. 获取 Flink 集群概览"
curl -s "$BASE_URL/api/v1/flink/overview" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/v1/flink/overview"
echo -e "\n"

# 4. 检查测试数据文件
echo "4. 检查测试数据文件"
if [ -d "/tmp/bigdata-test" ]; then
    echo "测试数据目录存在:"
    ls -lh /tmp/bigdata-test/
    echo ""
    echo "CSV 文件内容（前3行）:"
    head -3 /tmp/bigdata-test/sample_data.csv 2>/dev/null || echo "文件不存在"
else
    echo "测试数据目录不存在（需要重启服务器以创建）"
fi
echo ""

echo "=== 测试完成 ==="
