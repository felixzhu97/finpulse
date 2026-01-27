import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface ChartData {
  date: string;
  value: number;
  benchmark: number;
}

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent],
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
          <!-- Simple line chart representation -->
          <svg class="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradientValue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stop-color="oklch(0.65 0.2 250)" stop-opacity="0.4" />
                <stop offset="95%" stop-color="oklch(0.65 0.2 250)" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="gradientBenchmark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="5%" stop-color="oklch(0.7 0.22 160)" stop-opacity="0.3" />
                <stop offset="95%" stop-color="oklch(0.7 0.22 160)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <g stroke="oklch(0.25 0.02 260)" stroke-dasharray="3 3" stroke-width="1">
              <line x1="0" y1="60" x2="800" y2="60" />
              <line x1="0" y1="120" x2="800" y2="120" />
              <line x1="0" y1="180" x2="800" y2="180" />
              <line x1="0" y1="240" x2="800" y2="240" />
            </g>
            <!-- Area for benchmark -->
            <path
              [attr.d]="getAreaPath('benchmark')"
              fill="url(#gradientBenchmark)"
              stroke="oklch(0.7 0.22 160)"
              stroke-width="2"
            />
            <!-- Area for portfolio -->
            <path
              [attr.d]="getAreaPath('value')"
              fill="url(#gradientValue)"
              stroke="oklch(0.65 0.2 250)"
              stroke-width="2"
            />
          </svg>
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

  getAreaPath(key: 'value' | 'benchmark'): string {
    const width = 800;
    const height = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const values = this.data.map(d => d[key]);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const points = this.data.map((d, i) => {
      const x = padding + (i / (this.data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d[key] - min) / range) * chartHeight;
      return `${x},${y}`;
    });
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const firstX = firstPoint.split(',')[0];
    const lastX = lastPoint.split(',')[0];
    const bottomY = padding + chartHeight;
    
    return `M ${firstX},${bottomY} L ${firstPoint} ${points.slice(1).map(p => `L ${p}`).join(' ')} L ${lastX},${bottomY} Z`;
  }
}
