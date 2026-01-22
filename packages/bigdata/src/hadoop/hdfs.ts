/**
 * Hadoop HDFS 客户端
 * 提供 HDFS 文件系统操作
 */

import { HttpClient } from '../client';
import type { BigDataConfig } from '../config';
import type {
  HadoopConfig,
  HDFSFileRequest,
  HDFSFileStatus,
} from '../types';

export class HDFSClient {
  private client: HttpClient;
  private baseUrl: string;

  constructor(config: BigDataConfig) {
    this.client = new HttpClient(config);
    this.baseUrl = config.javaServiceUrl || 'http://localhost:8080';
  }

  /**
   * 初始化 Hadoop 服务
   */
  async initialize(hadoopConfig: HadoopConfig): Promise<{ status: string }> {
    return this.client.post<{ status: string }>('/api/v1/hadoop/init', hadoopConfig);
  }

  /**
   * 写入文件
   */
  async writeFile(path: string, data: Uint8Array | string): Promise<{ status: string; path: string }> {
    const request: HDFSFileRequest = {
      path,
      data: typeof data === 'string' ? new TextEncoder().encode(data) : data,
    };
    return this.client.post<{ status: string; path: string }>('/api/v1/hadoop/hdfs/write', request);
  }

  /**
   * 读取文件
   */
  async readFile(path: string): Promise<Uint8Array> {
    const url = `/api/v1/hadoop/hdfs/read?path=${encodeURIComponent(path)}`;
    return this.client.get<Uint8Array>(url);
  }

  /**
   * 列出目录内容
   */
  async listDirectory(path: string): Promise<HDFSFileStatus[]> {
    return this.client.get<HDFSFileStatus[]>('/api/v1/hadoop/hdfs/list', { path });
  }

  /**
   * 获取文件状态
   */
  async getFileStatus(path: string): Promise<HDFSFileStatus> {
    return this.client.get<HDFSFileStatus>('/api/v1/hadoop/hdfs/status', { path });
  }

  /**
   * 删除文件或目录
   */
  async deleteFile(path: string, recursive: boolean = false): Promise<{ status: string; path: string }> {
    const url = `/api/v1/hadoop/hdfs/delete?path=${encodeURIComponent(path)}&recursive=${recursive}`;
    return this.client.delete<{ status: string; path: string }>(url);
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<{ status: string; path: string }> {
    const url = `/api/v1/hadoop/hdfs/mkdir?path=${encodeURIComponent(path)}`;
    return this.client.post<{ status: string; path: string }>(url);
  }
}

/**
 * 创建 HDFS 客户端
 */
export function createHDFSClient(config?: Partial<BigDataConfig>): HDFSClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getBigDataConfig } = require('../config');
  return new HDFSClient(getBigDataConfig(config));
}
