/**
 * BigData 集成工具包共享类型定义
 */

export interface SparkSessionConfig {
  appName?: string;
  master?: string;
  warehouseDir?: string;
  configs?: Record<string, string>;
}

export interface SparkSessionResponse {
  sessionId: string;
  applicationId: string;
}

export interface SQLRequest {
  sql: string;
}

export interface QueryResult {
  data: Array<Record<string, any>>;
  rowCount: number;
}

export interface SparkJobRequest {
  jobName: string;
  config?: Record<string, any>;
}

export interface JobResponse {
  jobId: string;
  status: string;
}

export interface FlinkJobConfig {
  jobName?: string;
  parallelism?: number;
  checkpointInterval?: number;
  checkpointPath?: string;
  configs?: Record<string, string>;
}

export interface FlinkJobRequest {
  config: FlinkJobConfig;
  jobName: string;
}

export interface FlinkClusterOverview {
  taskManagers: number;
  slotsTotal: number;
  slotsAvailable: number;
}

export interface HadoopConfig {
  defaultFS?: string;
  userName?: string;
  configs?: Record<string, string>;
}

export interface HDFSFileRequest {
  path: string;
  data: Uint8Array | string;
}

export interface HDFSFileStatus {
  path: string;
  isDirectory: boolean;
  length: number;
  modificationTime: number;
}

export interface YARNApplication {
  applicationId: string;
  name: string;
  state: string;
  startTime: number;
}

export interface YARNClusterMetrics {
  numNodeManagers: number;
  numActiveNodeManagers: number;
  numDecommissionedNodeManagers: number;
}
