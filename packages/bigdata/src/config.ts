/**
 * BigData 配置工具
 * 支持从环境变量读取配置
 */

export interface BigDataConfig {
  javaServiceUrl?: string;
  spark?: {
    livyUrl?: string;
    username?: string;
    password?: string;
  };
  flink?: {
    restUrl?: string;
    username?: string;
    password?: string;
  };
  hadoop?: {
    hdfsUrl?: string;
    yarnUrl?: string;
    username?: string;
  };
}

/**
 * 获取 BigData 配置
 * 优先使用传入的配置，其次从环境变量读取
 */
export function getBigDataConfig(config?: Partial<BigDataConfig>): BigDataConfig {
  return {
    javaServiceUrl: config?.javaServiceUrl || process.env.BIGDATA_JAVA_SERVICE_URL || 'http://localhost:8080',
    spark: {
      livyUrl: config?.spark?.livyUrl || process.env.SPARK_LIVY_URL,
      username: config?.spark?.username || process.env.SPARK_USERNAME,
      password: config?.spark?.password || process.env.SPARK_PASSWORD,
    },
    flink: {
      restUrl: config?.flink?.restUrl || process.env.FLINK_REST_URL,
      username: config?.flink?.username || process.env.FLINK_USERNAME,
      password: config?.flink?.password || process.env.FLINK_PASSWORD,
    },
    hadoop: {
      hdfsUrl: config?.hadoop?.hdfsUrl || process.env.HADOOP_HDFS_URL,
      yarnUrl: config?.hadoop?.yarnUrl || process.env.HADOOP_YARN_URL,
      username: config?.hadoop?.username || process.env.HADOOP_USERNAME,
    },
  };
}
