/**
 * Flink 客户端
 * 提供 Flink 相关的 API 调用
 */

import { HttpClient } from '../client';
import type { BigDataConfig } from '../config';
import type {
  FlinkJobRequest,
  JobResponse,
  FlinkClusterOverview,
} from '../types';

export class FlinkClient {
  private client: HttpClient;

  constructor(config: BigDataConfig) {
    this.client = new HttpClient(config);
  }

  /**
   * 提交流处理作业
   */
  async submitJob(request: FlinkJobRequest): Promise<JobResponse> {
    return this.client.post<JobResponse>('/api/v1/flink/jobs', request);
  }

  /**
   * 查询作业状态
   */
  async getJobStatus(jobId: string): Promise<JobResponse> {
    return this.client.get<JobResponse>(`/api/v1/flink/jobs/${jobId}`);
  }

  /**
   * 取消作业
   */
  async cancelJob(jobId: string): Promise<void> {
    await this.client.post(`/api/v1/flink/jobs/${jobId}/cancel`);
  }

  /**
   * 获取集群概览
   */
  async getClusterOverview(): Promise<FlinkClusterOverview> {
    return this.client.get<FlinkClusterOverview>('/api/v1/flink/overview');
  }
}

/**
 * 创建 Flink 客户端
 */
export function createFlinkClient(config?: Partial<BigDataConfig>): FlinkClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getBigDataConfig } = require('../config');
  return new FlinkClient(getBigDataConfig(config));
}
