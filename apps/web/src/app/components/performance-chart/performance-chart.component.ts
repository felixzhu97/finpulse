import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, TooltipItem, ChartTypeRegistry } from 'chart.js';

interface ChartData {
  date: string;
  value: number;
  benchmark: number;
}

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, BaseChartDirective],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="flex flex-row items-center justify-between pb-2">
        <div>
          <app-card-title className="text-lg font-semibold">Portfolio Performance</app-card-title>
          <p class="text-sm text-muted-foreground">vs Benchmark Index</p>
        </div>
        <div class="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          <app-button
            *ngFor="let range of timeRanges"
            [variant]="activeRange === range ? 'default' : 'ghost'"
            size="sm"
            (onClick)="activeRange = range"
            [className]="activeRange === range ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
          >
            {{ range }}
          </app-button>
        </div>
      </app-card-header>
      <app-card-content className="pt-4">
        <div class="h-[300px]">
          <canvas baseChart
            [type]="chartType"
            [data]="chartData"
            [options]="chartOptions"
            [legend]="false">
          </canvas>
        </div>
        <div class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-primary"></div>
            <span class="text-sm text-muted-foreground">Portfolio</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-accent"></div>
            <span class="text-sm text-muted-foreground">Benchmark</span>
          </div>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class PerformanceChartComponent {
  activeRange = '1Y';
  chartType: ChartType = 'line';

  timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'All'];

  data: ChartData[] = [
    { date: 'Jan', value: 10000000, benchmark: 9800000 },
    { date: 'Feb', value: 10500000, benchmark: 10000000 },
    { date: 'Mar', value: 10200000, benchmark: 10100000 },
    { date: 'Apr', value: 11200000, benchmark: 10400000 },
    { date: 'May', value: 11800000, benchmark: 10600000 },
    { date: 'Jun', value: 11500000, benchmark: 10800000 },
    { date: 'Jul', value: 12100000, benchmark: 11000000 },
    { date: 'Aug', value: 12400000, benchmark: 11200000 },
    { date: 'Sep', value: 12000000, benchmark: 11100000 },
    { date: 'Oct', value: 12300000, benchmark: 11300000 },
    { date: 'Nov', value: 12600000, benchmark: 11500000 },
    { date: 'Dec', value: 12847382, benchmark: 11700000 }
  ];

  get chartData(): ChartConfiguration['data'] {
    return {
      labels: this.data.map(d => d.date),
      datasets: [
        {
          label: 'Portfolio',
          data: this.data.map(d => d.value),
          borderColor: 'oklch(0.65 0.2 250)',
          backgroundColor: 'oklch(0.65 0.2 250 / 0.4)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Benchmark',
          data: this.data.map(d => d.benchmark),
          borderColor: 'oklch(0.7 0.22 160)',
          backgroundColor: 'oklch(0.7 0.22 160 / 0.3)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    };
  }

  get chartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'oklch(0.14 0.015 260 / 0.95)',
          titleColor: 'oklch(0.98 0 0)',
          bodyColor: 'oklch(0.98 0 0)',
          borderColor: 'oklch(0.25 0.02 260)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context: TooltipItem<keyof ChartTypeRegistry>) => {
              const value = (context.parsed as any).y;
              if (value === null || value === undefined) return '';
              return `${context.dataset.label}: ¥${(value / 1000000).toFixed(2)}M`;
            }
          }
        }
      },
      scales: {
        x: {
          border: {
            display: false
          },
          grid: {
            color: 'oklch(0.25 0.02 260)',
            lineWidth: 1,
            drawOnChartArea: true
          },
          ticks: {
            color: 'oklch(0.6 0.02 260)',
            font: {
              size: 11
            }
          }
        },
        y: {
          border: {
            display: false
          },
          grid: {
            color: 'oklch(0.25 0.02 260)',
            lineWidth: 1,
            drawOnChartArea: true
          },
          ticks: {
            color: 'oklch(0.6 0.02 260)',
            font: {
              size: 11
            },
            callback: (value) => {
              return `¥${((value as number) / 1000000).toFixed(1)}M`;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }
}
