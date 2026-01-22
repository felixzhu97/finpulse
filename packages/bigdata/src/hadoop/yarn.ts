/**
 * Hadoop YARN 客户端
 * 提供 YARN 资源管理功能
 */

import { HttpClient } from '../client';
import type { BigDataConfig } from '../config';
import type {
  YARNApplication,
  YARNClusterMetrics,
} from '../types';

export class YARNClient {
  private client: HttpClient;

  constructor(config: BigDataConfig) {
    this.client = new HttpClient(config);
  }

  /**
   * 列出应用程序
   */
  async listApplications(state?: string): Promise<YARNApplication[]> {
    const params = state ? { state } : undefined;
    return this.client.get<YARNApplication[]>('/api/v1/hadoop/yarn/applications', params);
  }

  /**
   * 获取集群指标
   */
  async getClusterMetrics(): Promise<YARNClusterMetrics> {
    return this.client.get<YARNClusterMetrics>('/api/v1/hadoop/yarn/metrics');
  }
}

/**
 * 创建 YARN 客户端
 */
export function createYARNClient(config?: Partial<BigDataConfig>): YARNClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getBigDataConfig } = require('../config');
  return new YARNClient(getBigDataConfig(config));
}
