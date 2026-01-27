import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, TooltipItem } from 'chart.js';

interface AssetData {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-asset-allocation',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, BaseChartDirective],
  template: `
    <app-card className="bg-card border-border glass h-full">
      <app-card-header className="pb-2">
        <app-card-title className="text-lg font-semibold">Asset Allocation</app-card-title>
      </app-card-header>
      <app-card-content>
        <div class="h-[200px] relative flex items-center justify-center">
          <canvas baseChart
            [type]="chartType"
            [data]="chartData"
            [options]="chartOptions"
            [legend]="false">
          </canvas>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center">
              <p class="text-2xl font-bold">¥12.8M</p>
              <p class="text-xs text-muted-foreground">Total Assets</p>
            </div>
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <div *ngFor="let item of data" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [style.backgroundColor]="item.color"></div>
              <span class="text-sm text-muted-foreground">{{ item.name }}</span>
            </div>
            <span class="text-sm font-medium">{{ item.value }}%</span>
          </div>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class AssetAllocationComponent {
  chartType: ChartType = 'doughnut';

  data: AssetData[] = [
    { name: 'Stocks', value: 45, color: 'oklch(0.65 0.2 250)' },
    { name: 'Bonds', value: 25, color: 'oklch(0.7 0.22 160)' },
    { name: 'Funds', value: 15, color: 'oklch(0.75 0.18 80)' },
    { name: 'Cash', value: 10, color: 'oklch(0.7 0.15 300)' },
    { name: 'Other', value: 5, color: 'oklch(0.6 0.02 260)' }
  ];

  get chartData(): ChartConfiguration['data'] {
    return {
      labels: this.data.map(d => d.name),
      datasets: [
        {
          data: this.data.map(d => d.value),
          backgroundColor: this.data.map(d => d.color),
          borderColor: 'oklch(0.14 0.015 260)',
          borderWidth: 2
        }
      ]
    };
  }

  get chartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%' as any,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'oklch(0.14 0.015 260 / 0.95)',
          titleColor: 'oklch(0.98 0 0)',
          bodyColor: 'oklch(0.98 0 0)',
          borderColor: 'oklch(0.25 0.02 260)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value}%`;
            }
          }
        }
      }
    } as any;
  }
}
