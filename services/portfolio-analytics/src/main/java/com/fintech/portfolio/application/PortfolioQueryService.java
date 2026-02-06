package com.fintech.portfolio.application;

import com.fintech.portfolio.domain.Account;
import com.fintech.portfolio.domain.Holding;
import com.fintech.portfolio.domain.Portfolio;
import com.fintech.portfolio.domain.PortfolioHistoryPoint;
import com.fintech.portfolio.domain.PortfolioSummary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PortfolioQueryService {

    public Portfolio getDemoPortfolio() {
        Portfolio portfolio = new Portfolio();
        portfolio.setId("demo-portfolio");
        portfolio.setOwnerName("Demo User");
        portfolio.setBaseCurrency("USD");

        List<Account> accounts = new ArrayList<>();

        Account brokerage = new Account();
        brokerage.setId("acc-brokerage-1");
        brokerage.setName("Brokerage Account");
        brokerage.setType("brokerage");
        brokerage.setCurrency("USD");
        brokerage.setBalance(125000);
        brokerage.setTodayChange(1200);

        List<Holding> holdings = new ArrayList<>();

        Holding aapl = new Holding();
        aapl.setId("h-aapl");
        aapl.setSymbol("AAPL");
        aapl.setName("Apple Inc.");
        aapl.setQuantity(150);
        aapl.setPrice(190);
        aapl.setCostBasis(160);
        aapl.setMarketValue(150 * 190);
        aapl.setProfit(150 * (190 - 160));
        aapl.setProfitRate((190 - 160) / 160.0);
        aapl.setAssetClass("equity");
        aapl.setRiskLevel("medium");
        holdings.add(aapl);

        Holding msft = new Holding();
        msft.setId("h-msft");
        msft.setSymbol("MSFT");
        msft.setName("Microsoft Corp.");
        msft.setQuantity(80);
        msft.setPrice(420);
        msft.setCostBasis(350);
        msft.setMarketValue(80 * 420);
        msft.setProfit(80 * (420 - 350));
        msft.setProfitRate((420 - 350) / 350.0);
        msft.setAssetClass("equity");
        msft.setRiskLevel("medium");
        holdings.add(msft);

        brokerage.setHoldings(holdings);
        accounts.add(brokerage);

        Account saving = new Account();
        saving.setId("acc-saving-1");
        saving.setName("High Yield Savings");
        saving.setType("saving");
        saving.setCurrency("USD");
        saving.setBalance(30000);
        saving.setTodayChange(5);

        List<Holding> savingHoldings = new ArrayList<>();
        Holding cash = new Holding();
        cash.setId("h-cash-usd");
        cash.setSymbol("CASH");
        cash.setName("Cash");
        cash.setQuantity(30000);
        cash.setPrice(1);
        cash.setCostBasis(1);
        cash.setMarketValue(30000);
        cash.setProfit(0);
        cash.setProfitRate(0);
        cash.setAssetClass("cash");
        cash.setRiskLevel("low");
        savingHoldings.add(cash);
        saving.setHoldings(savingHoldings);
        accounts.add(saving);

        Account credit = new Account();
        credit.setId("acc-credit-1");
        credit.setName("Credit Card");
        credit.setType("creditCard");
        credit.setCurrency("USD");
        credit.setBalance(-3500);
        credit.setTodayChange(0);
        credit.setHoldings(new ArrayList<>());
        accounts.add(credit);

        portfolio.setAccounts(accounts);

        PortfolioSummary summary = new PortfolioSummary();
        summary.setTotalAssets(125000 + 30000);
        summary.setTotalLiabilities(3500);
        summary.setNetWorth(125000 + 30000 - 3500);
        summary.setTodayChange(1200 + 5);
        summary.setWeekChange(3200);
        portfolio.setSummary(summary);

        List<PortfolioHistoryPoint> history = new ArrayList<>();
        history.add(point("2024-09-01", 140000));
        history.add(point("2024-09-02", 141200));
        history.add(point("2024-09-03", 139800));
        history.add(point("2024-09-04", 142000));
        history.add(point("2024-09-05", 143500));
        history.add(point("2024-09-06", 144200));
        history.add(point("2024-09-07", 145700));
        portfolio.setHistory(history);

        return portfolio;
    }

    private PortfolioHistoryPoint point(String date, double value) {
        PortfolioHistoryPoint p = new PortfolioHistoryPoint();
        p.setDate(date);
        p.setValue(value);
        return p;
    }
}

