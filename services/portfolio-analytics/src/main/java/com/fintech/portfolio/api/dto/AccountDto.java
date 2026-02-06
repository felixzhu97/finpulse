package com.fintech.portfolio.api.dto;

import java.util.List;

public class AccountDto {
    private String id;
    private String name;
    private String type;
    private String currency;
    private double balance;
    private double todayChange;
    private List<HoldingDto> holdings;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public double getTodayChange() {
        return todayChange;
    }

    public void setTodayChange(double todayChange) {
        this.todayChange = todayChange;
    }

    public List<HoldingDto> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<HoldingDto> holdings) {
        this.holdings = holdings;
    }
}

