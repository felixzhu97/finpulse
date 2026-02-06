package com.fintech.bigdata.api.dto;

import java.util.List;
import java.util.Map;

/**
 * 查询结果
 */
public class QueryResult {
    private List<Map<String, Object>> data;
    private int rowCount;

    public QueryResult() {
    }

    public QueryResult(List<Map<String, Object>> data) {
        this.data = data;
        this.rowCount = data != null ? data.size() : 0;
    }

    public List<Map<String, Object>> getData() {
        return data;
    }

    public void setData(List<Map<String, Object>> data) {
        this.data = data;
        this.rowCount = data != null ? data.size() : 0;
    }

    public int getRowCount() {
        return rowCount;
    }

    public void setRowCount(int rowCount) {
        this.rowCount = rowCount;
    }
}
