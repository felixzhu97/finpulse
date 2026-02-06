package com.fintech.portfolio.api.dto;

import java.util.List;

public class PortfolioDto {
    private String id;
    private String ownerName;
    private String baseCurrency;
    private List<AccountDto> accounts;
    private PortfolioSummaryDto summary;
    private List<PortfolioHistoryPointDto> history;

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

    public List<AccountDto> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountDto> accounts) {
        this.accounts = accounts;
    }

    public PortfolioSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(PortfolioSummaryDto summary) {
        this.summary = summary;
    }

    public List<PortfolioHistoryPointDto> getHistory() {
        return history;
    }

    public void setHistory(List<PortfolioHistoryPointDto> history) {
        this.history = history;
    }
}

