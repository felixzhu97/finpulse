package com.fintech.portfolio.api;

import com.fintech.portfolio.api.dto.AccountDto;
import com.fintech.portfolio.api.dto.HoldingDto;
import com.fintech.portfolio.api.dto.PortfolioDto;
import com.fintech.portfolio.api.dto.PortfolioHistoryPointDto;
import com.fintech.portfolio.api.dto.PortfolioSummaryDto;
import com.fintech.portfolio.domain.Account;
import com.fintech.portfolio.domain.Holding;
import com.fintech.portfolio.domain.Portfolio;
import com.fintech.portfolio.domain.PortfolioHistoryPoint;
import com.fintech.portfolio.domain.PortfolioSummary;

import java.util.List;
import java.util.stream.Collectors;

public class PortfolioMapper {

    public PortfolioDto toDto(Portfolio portfolio) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(portfolio.getId());
        dto.setOwnerName(portfolio.getOwnerName());
        dto.setBaseCurrency(portfolio.getBaseCurrency());
        dto.setAccounts(toAccountDtos(portfolio.getAccounts()));
        dto.setSummary(toSummaryDto(portfolio.getSummary()));
        dto.setHistory(toHistoryDtos(portfolio.getHistory()));
        return dto;
    }

    private List<AccountDto> toAccountDtos(List<Account> accounts) {
        return accounts.stream().map(this::toAccountDto).collect(Collectors.toList());
    }

    private AccountDto toAccountDto(Account account) {
        AccountDto dto = new AccountDto();
        dto.setId(account.getId());
        dto.setName(account.getName());
        dto.setType(account.getType());
        dto.setCurrency(account.getCurrency());
        dto.setBalance(account.getBalance());
        dto.setTodayChange(account.getTodayChange());
        dto.setHoldings(toHoldingDtos(account.getHoldings()));
        return dto;
    }

    private List<HoldingDto> toHoldingDtos(List<Holding> holdings) {
        return holdings.stream().map(this::toHoldingDto).collect(Collectors.toList());
    }

    private HoldingDto toHoldingDto(Holding holding) {
        HoldingDto dto = new HoldingDto();
        dto.setId(holding.getId());
        dto.setSymbol(holding.getSymbol());
        dto.setName(holding.getName());
        dto.setQuantity(holding.getQuantity());
        dto.setPrice(holding.getPrice());
        dto.setCostBasis(holding.getCostBasis());
        dto.setMarketValue(holding.getMarketValue());
        dto.setProfit(holding.getProfit());
        dto.setProfitRate(holding.getProfitRate());
        dto.setAssetClass(holding.getAssetClass());
        dto.setRiskLevel(holding.getRiskLevel());
        return dto;
    }

    private PortfolioSummaryDto toSummaryDto(PortfolioSummary summary) {
        PortfolioSummaryDto dto = new PortfolioSummaryDto();
        dto.setTotalAssets(summary.getTotalAssets());
        dto.setTotalLiabilities(summary.getTotalLiabilities());
        dto.setNetWorth(summary.getNetWorth());
        dto.setTodayChange(summary.getTodayChange());
        dto.setWeekChange(summary.getWeekChange());
        return dto;
    }

    private List<PortfolioHistoryPointDto> toHistoryDtos(List<PortfolioHistoryPoint> history) {
        return history.stream().map(this::toHistoryDto).collect(Collectors.toList());
    }

    private PortfolioHistoryPointDto toHistoryDto(PortfolioHistoryPoint point) {
        PortfolioHistoryPointDto dto = new PortfolioHistoryPointDto();
        dto.setDate(point.getDate());
        dto.setValue(point.getValue());
        return dto;
    }
}

