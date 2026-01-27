import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioOverviewComponent } from '../../components/portfolio-overview/portfolio-overview.component';
import { MarketTrendsComponent } from '../../components/market-trends/market-trends.component';
import { AssetAllocationComponent } from '../../components/asset-allocation/asset-allocation.component';
import { PerformanceChartComponent } from '../../components/performance-chart/performance-chart.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
import { WatchListComponent } from '../../components/watch-list/watch-list.component';
import { RiskAnalysisComponent } from '../../components/risk-analysis/risk-analysis.component';
import { QuickActionsComponent } from '../../components/quick-actions/quick-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioOverviewComponent,
    MarketTrendsComponent,
    AssetAllocationComponent,
    PerformanceChartComponent,
    RecentTransactionsComponent,
    WatchListComponent,
    RiskAnalysisComponent,
    QuickActionsComponent
  ],
  template: `
    <div class="grid grid-cols-12 gap-6">
      <!-- Top row - Portfolio Overview -->
      <div class="col-span-12">
        <app-portfolio-overview></app-portfolio-overview>
      </div>

      <!-- Second row - Charts -->
      <div class="col-span-8">
        <app-performance-chart></app-performance-chart>
      </div>
      <div class="col-span-4">
        <app-asset-allocation></app-asset-allocation>
      </div>

      <!-- Third row - Market & Watch -->
      <div class="col-span-5">
        <app-market-trends></app-market-trends>
      </div>
      <div class="col-span-4">
        <app-watch-list></app-watch-list>
      </div>
      <div class="col-span-3">
        <app-quick-actions></app-quick-actions>
      </div>

      <!-- Bottom row - Transactions & Risk -->
      <div class="col-span-7">
        <app-recent-transactions></app-recent-transactions>
      </div>
      <div class="col-span-5">
        <app-risk-analysis></app-risk-analysis>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
}
