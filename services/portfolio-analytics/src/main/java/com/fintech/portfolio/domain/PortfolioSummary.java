package com.fintech.portfolio.domain;

public class PortfolioSummary {
    private double totalAssets;
    private double totalLiabilities;
    private double netWorth;
    private double todayChange;
    private double weekChange;

    public double getTotalAssets() {
        return totalAssets;
    }

    public void setTotalAssets(double totalAssets) {
        this.totalAssets = totalAssets;
    }

    public double getTotalLiabilities() {
        return totalLiabilities;
    }

    public void setTotalLiabilities(double totalLiabilities) {
        this.totalLiabilities = totalLiabilities;
    }

    public double getNetWorth() {
        return netWorth;
    }

    public void setNetWorth(double netWorth) {
        this.netWorth = netWorth;
    }

    public double getTodayChange() {
        return todayChange;
    }

    public void setTodayChange(double todayChange) {
        this.todayChange = todayChange;
    }

    public double getWeekChange() {
        return weekChange;
    }

    public void setWeekChange(double weekChange) {
        this.weekChange = weekChange;
    }
}

