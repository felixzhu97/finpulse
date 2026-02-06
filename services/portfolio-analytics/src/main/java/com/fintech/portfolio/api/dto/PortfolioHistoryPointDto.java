package com.fintech.portfolio.api.dto;

public class PortfolioHistoryPointDto {
    private String date;
    private double value;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}

