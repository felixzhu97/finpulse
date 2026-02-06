import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, TooltipItem, ChartTypeRegistry, registerables } from 'chart.js';
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';

Chart.register(...registerables, CandlestickController, OhlcController, CandlestickElement, OhlcElement);

type Candle = {
  x: string;
  o: number;
  h: number;
  l: number;
  c: number;
};

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-card border border-border rounded-xl p-4 h-[320px] flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-base font-semibold">Stock price</h2>
          <p class="text-xs text-muted-foreground">Daily candlestick example</p>
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-secondary/60 text-secondary-foreground">
          Demo data
        </span>
      </div>
      <div class="flex-1">
        <canvas
          baseChart
          [type]="chartType"
          [data]="chartData"
          [options]="chartOptions"
          [legend]="false"
        ></canvas>
      </div>
    </div>
  `,
})
export class StockChartComponent {
  chartType: ChartType = 'candlestick';

  candles: Candle[] = [
    { x: 'Mon', o: 102, h: 108, l: 100, c: 106 },
    { x: 'Tue', o: 106, h: 110, l: 103, c: 104 },
    { x: 'Wed', o: 104, h: 112, l: 102, c: 111 },
    { x: 'Thu', o: 111, h: 115, l: 109, c: 112 },
    { x: 'Fri', o: 112, h: 118, l: 111, c: 117 },
  ];

  get chartData(): ChartConfiguration['data'] {
    return {
      labels: this.candles.map(c => c.x),
      datasets: [
        {
          label: 'Price',
          data: this.candles as any,
          borderColor: 'oklch(0.7 0.15 250)',
          backgroundColor: 'oklch(0.7 0.15 250 / 0.4)',
        } as any,
      ],
    };
  }

  get chartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: TooltipItem<keyof ChartTypeRegistry>) => {
              const value = context.raw as any;
              if (!value) {
                return '';
              }
              return `O ${value.o}  H ${value.h}  L ${value.l}  C ${value.c}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: 'oklch(0.6 0.02 260)',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: 'oklch(0.25 0.02 260)',
          },
          ticks: {
            color: 'oklch(0.6 0.02 260)',
            font: {
              size: 11,
            },
          },
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
    };
  }
}

