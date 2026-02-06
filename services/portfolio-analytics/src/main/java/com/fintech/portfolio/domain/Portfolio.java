package com.fintech.portfolio.domain;

import java.util.List;

public class Portfolio {
    private String id;
    private String ownerName;
    private String baseCurrency;
    private List<Account> accounts;
    private PortfolioSummary summary;
    private List<PortfolioHistoryPoint> history;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<Account> accounts) {
        this.accounts = accounts;
    }

    public PortfolioSummary getSummary() {
        return summary;
    }

    public void setSummary(PortfolioSummary summary) {
        this.summary = summary;
    }

    public List<PortfolioHistoryPoint> getHistory() {
        return history;
    }

    public void setHistory(List<PortfolioHistoryPoint> history) {
        this.history = history;
    }
}

