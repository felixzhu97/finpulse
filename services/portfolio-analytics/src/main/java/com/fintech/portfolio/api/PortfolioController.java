package com.fintech.portfolio.api;

import com.fintech.portfolio.api.dto.PortfolioDto;
import com.fintech.portfolio.application.PortfolioQueryService;
import com.fintech.portfolio.domain.Portfolio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portfolio")
public class PortfolioController {

    private final PortfolioQueryService portfolioQueryService;
    private final PortfolioMapper portfolioMapper = new PortfolioMapper();

    public PortfolioController(PortfolioQueryService portfolioQueryService) {
        this.portfolioQueryService = portfolioQueryService;
    }

    @GetMapping
    public ResponseEntity<PortfolioDto> getPortfolio() {
        Portfolio portfolio = portfolioQueryService.getDemoPortfolio();
        PortfolioDto dto = portfolioMapper.toDto(portfolio);
        return ResponseEntity.ok(dto);
    }
}

