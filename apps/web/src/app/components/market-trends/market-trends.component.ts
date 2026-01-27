import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

interface Market {
  name: string;
  code: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
  data: number[];
}

@Component({
  selector: 'app-market-trends',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, BaseChartDirective],
  template: `
    <app-card className="bg-card border-border glass h-full">
      <app-card-header className="pb-2">
        <app-card-title className="text-lg font-semibold">Market Trends</app-card-title>
      </app-card-header>
      <app-card-content className="space-y-3">
        <div
          *ngFor="let market of markets; let i = index"
          class="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <div class="flex-1">
            <p class="font-medium text-sm">{{ market.name }}</p>
            <p class="text-xs text-muted-foreground">{{ market.code }}</p>
          </div>
          <div class="w-20 h-8 mx-4">
            <canvas baseChart
              [type]="chartType"
              [data]="getChartData(market)"
              [options]="getChartOptions(market)"
              [legend]="false">
            </canvas>
          </div>
          <div class="text-right">
            <p class="font-semibold text-sm">{{ market.price }}</p>
            <div [class]="'flex items-center justify-end gap-0.5 text-xs font-medium ' + (market.trend === 'up' ? 'text-accent' : 'text-destructive')">
              <svg *ngIf="market.trend === 'up'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <svg *ngIf="market.trend === 'down'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17l5-5m0 0l-5-5m5 5H6" />
              </svg>
              {{ market.change }}
            </div>
          </div>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class MarketTrendsComponent {
  chartType: ChartType = 'line';

  markets: Market[] = [
    {
      name: 'Shanghai Composite',
      code: 'SH000001',
      price: '3,254.68',
      change: '+1.24%',
      trend: 'up',
      data: [30, 32, 35, 33, 38, 40, 42, 45, 43, 48]
    },
    {
      name: 'Shenzhen Component',
      code: 'SZ399001',
      price: '10,847.32',
      change: '+0.87%',
      trend: 'up',
      data: [40, 38, 42, 45, 43, 47, 50, 48, 52, 55]
    },
    {
      name: 'ChiNext Index',
      code: 'SZ399006',
      price: '2,156.47',
      change: '-0.32%',
      trend: 'down',
      data: [50, 48, 52, 49, 47, 45, 48, 46, 44, 42]
    },
    {
      name: 'Hang Seng Index',
      code: 'HK.HSI',
      price: '17,432.56',
      change: '+2.15%',
      trend: 'up',
      data: [35, 38, 40, 42, 45, 48, 50, 53, 56, 58]
    },
    {
      name: 'NASDAQ',
      code: 'NASDAQ',
      price: '16,742.89',
      change: '+0.56%',
      trend: 'up',
      data: [60, 62, 58, 65, 63, 68, 70, 72, 69, 74]
    }
  ];

  getChartData(market: Market): ChartConfiguration['data'] {
    return {
      labels: market.data.map((_, i) => ''),
      datasets: [
        {
          data: market.data,
          borderColor: market.trend === 'up' ? 'oklch(0.7 0.22 160)' : 'oklch(0.6 0.2 25)',
          backgroundColor: market.trend === 'up' ? 'oklch(0.7 0.22 160 / 0.1)' : 'oklch(0.6 0.2 25 / 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2
        }
      ]
    };
  }

  getChartOptions(market: Market): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      },
      elements: {
        point: {
          radius: 0
        }
      }
    };
  }
}
