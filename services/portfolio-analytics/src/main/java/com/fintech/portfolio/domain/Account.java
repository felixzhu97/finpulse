package com.fintech.portfolio.domain;

import java.util.List;

public class Account {
    private String id;
    private String name;
    private String type;
    private String currency;
    private double balance;
    private double todayChange;
    private List<Holding> holdings;

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

    public List<Holding> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<Holding> holdings) {
        this.holdings = holdings;
    }
}

