package com.fintech.bigdata.spark;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Spark 作业执行器
 * 负责执行批处理作业和数据处理任务
 */
@Component
public class SparkJobExecutor {
    private static final Logger logger = LoggerFactory.getLogger(SparkJobExecutor.class);

    /**
     * 执行 DataFrame 转换
     */
    public Dataset<Row> transformDataFrame(
            SparkSession session,
            Dataset<Row> inputDF,
            Map<String, Object> transformations) {
        logger.debug("Transforming DataFrame with {} transformations", transformations.size());

        Dataset<Row> result = inputDF;

        // 应用过滤
        if (transformations.containsKey("filter")) {
            String filterExpr = (String) transformations.get("filter");
            result = result.filter(filterExpr);
        }

        // 应用分组和聚合
        if (transformations.containsKey("groupBy")) {
            @SuppressWarnings("unchecked")
            List<String> groupByCols = (List<String>) transformations.get("groupBy");
            // groupBy 返回 RelationalGroupedDataset，需要调用 agg() 才能得到 Dataset<Row>
            org.apache.spark.sql.RelationalGroupedDataset grouped;
            if (groupByCols.size() == 1) {
                grouped = result.groupBy(groupByCols.get(0));
            } else if (groupByCols.size() > 1) {
                // 使用字符串变参方法
                String[] cols = groupByCols.toArray(new String[0]);
                grouped = result.groupBy(cols[0], Arrays.copyOfRange(cols, 1, cols.length));
            } else {
                return result; // 如果没有分组列，直接返回
            }

            if (transformations.containsKey("agg")) {
                @SuppressWarnings("unchecked")
                Map<String, String> aggs = (Map<String, String>) transformations.get("agg");
                // 这里需要根据实际的聚合表达式来构建
                // 简化示例：如果没有聚合，使用 count()
                result = grouped.count();
            } else {
                // 如果没有指定聚合，使用 count() 作为默认
                result = grouped.count();
            }
        }

        // 应用选择列
        if (transformations.containsKey("select")) {
            @SuppressWarnings("unchecked")
            List<String> selectCols = (List<String>) transformations.get("select");
            // 将字符串数组转换为 Column 数组，或使用字符串变参方法
            if (selectCols.size() == 1) {
                result = result.select(selectCols.get(0));
            } else if (selectCols.size() > 1) {
                // 使用字符串变参方法
                String[] cols = selectCols.toArray(new String[0]);
                result = result.select(cols[0], Arrays.copyOfRange(cols, 1, cols.length));
            }
        }

        return result;
    }

    /**
     * 读取数据源
     */
    public Dataset<Row> readDataSource(SparkSession session, String format, String path) {
        logger.debug("Reading data from {}: {}", format, path);
        return session.read().format(format).load(path);
    }

    /**
     * 写入数据源
     */
    public void writeDataSource(Dataset<Row> df, String format, String path, Map<String, String> options) {
        logger.debug("Writing data to {}: {}", format, path);
        var writer = df.write().format(format);
        
        if (options != null) {
            for (Map.Entry<String, String> option : options.entrySet()) {
                writer = writer.option(option.getKey(), option.getValue());
            }
        }
        
        writer.save(path);
    }

    /**
     * 执行批处理作业
     */
    public String submitBatchJob(SparkSession session, String jobName, Runnable job) {
        logger.info("Submitting batch job: {}", jobName);
        // 在实际场景中，这里应该异步执行作业
        // 简化示例：直接执行
        try {
            job.run();
            return "job_" + System.currentTimeMillis();
        } catch (Exception e) {
            logger.error("Error executing batch job: {}", jobName, e);
            throw new RuntimeException("Failed to execute batch job", e);
        }
    }
}
