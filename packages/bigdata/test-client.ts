/**
 * BigData 服务测试客户端
 * 用于测试 Java REST API 服务
 */

import { createSparkClient, createFlinkClient, createHDFSClient, createYARNClient } from './src/index';

const JAVA_SERVICE_URL = process.env.BIGDATA_JAVA_SERVICE_URL || 'http://localhost:8080';

async function testHealthCheck() {
  console.log('\n=== 测试健康检查 ===');
  try {
    const response = await fetch(`${JAVA_SERVICE_URL}/api/v1/health`);
    const data = await response.json();
    console.log('健康状态:', data);
  } catch (error) {
    console.error('健康检查失败:', error);
  }
}

async function testSpark() {
  console.log('\n=== 测试 Spark ===');
  try {
    const sparkClient = createSparkClient({ javaServiceUrl: JAVA_SERVICE_URL });
    
    // 创建会话
    console.log('创建 SparkSession...');
    const session = await sparkClient.createSession({
      appName: 'test-app',
      master: 'local[*]',
    });
    console.log('会话创建成功:', session);
    
    // 执行 SQL（需要先有数据）
    // const result = await sparkClient.executeSQL(session.sessionId, 'SELECT 1 as test');
    // console.log('SQL 执行结果:', result);
    
    // 关闭会话
    // await sparkClient.closeSession(session.sessionId);
  } catch (error) {
    console.error('Spark 测试失败:', error);
  }
}

async function testHadoop() {
  console.log('\n=== 测试 Hadoop HDFS ===');
  try {
    const hdfsClient = createHDFSClient({ javaServiceUrl: JAVA_SERVICE_URL });
    
    // 初始化 Hadoop
    console.log('初始化 Hadoop 服务...');
    await hdfsClient.initialize({
      defaultFS: 'file:///',
      userName: process.env.USER || 'user',
    });
    console.log('Hadoop 初始化成功');
    
    // 列出测试目录
    console.log('列出测试目录...');
    const files = await hdfsClient.listDirectory('/tmp/bigdata-test');
    console.log('文件列表:', files);
    
    // 读取测试文件
    if (files.length > 0) {
      console.log('读取测试文件...');
      const data = await hdfsClient.readFile('/tmp/bigdata-test/sample_data.txt');
      const text = new TextDecoder().decode(data);
      console.log('文件内容:', text.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Hadoop 测试失败:', error);
  }
}

async function testFlink() {
  console.log('\n=== 测试 Flink ===');
  try {
    const flinkClient = createFlinkClient({ javaServiceUrl: JAVA_SERVICE_URL });
    
    // 获取集群概览
    console.log('获取 Flink 集群概览...');
    const overview = await flinkClient.getClusterOverview();
    console.log('集群概览:', overview);
  } catch (error) {
    console.error('Flink 测试失败:', error);
  }
}

async function runTests() {
  console.log('开始测试 BigData 服务...');
  console.log('服务地址:', JAVA_SERVICE_URL);
  
  await testHealthCheck();
  await testHadoop();
  await testSpark();
  await testFlink();
  
  console.log('\n测试完成！');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
