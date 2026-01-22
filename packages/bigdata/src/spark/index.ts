/**
 * Spark 客户端
 * 提供 Spark 相关的 API 调用
 */

import { HttpClient } from '../client';
import type { BigDataConfig } from '../config';
import type {
  SparkSessionConfig,
  SparkSessionResponse,
  SQLRequest,
  QueryResult,
  SparkJobRequest,
  JobResponse,
} from '../types';

export class SparkClient {
  private client: HttpClient;

  constructor(config: BigDataConfig) {
    this.client = new HttpClient(config);
  }

  /**
   * 创建 SparkSession
   */
  async createSession(config: SparkSessionConfig): Promise<SparkSessionResponse> {
    return this.client.post<SparkSessionResponse>('/api/v1/spark/sessions', {
      config: {
        appName: config.appName,
        master: config.master,
        warehouseDir: config.warehouseDir,
        configs: config.configs,
      },
    });
  }

  /**
   * 执行 SQL 查询
   */
  async executeSQL(sessionId: string, sql: string): Promise<QueryResult> {
    return this.client.post<QueryResult>(`/api/v1/spark/sessions/${sessionId}/sql`, {
      sql,
    } as SQLRequest);
  }

  /**
   * 提交批处理作业
   */
  async submitJob(request: SparkJobRequest): Promise<JobResponse> {
    return this.client.post<JobResponse>('/api/v1/spark/jobs', request);
  }

  /**
   * 查询作业状态
   */
  async getJobStatus(jobId: string): Promise<JobResponse> {
    return this.client.get<JobResponse>(`/api/v1/spark/jobs/${jobId}`);
  }

  /**
   * 关闭会话
   */
  async closeSession(sessionId: string): Promise<void> {
    await this.client.delete(`/api/v1/spark/sessions/${sessionId}`);
  }
}

/**
 * 创建 Spark 客户端
 */
export function createSparkClient(config?: Partial<BigDataConfig>): SparkClient {
  // 使用动态导入避免循环依赖
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getBigDataConfig } = require('../config');
  return new SparkClient(getBigDataConfig(config));
}
