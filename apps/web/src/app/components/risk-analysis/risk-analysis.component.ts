import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';

interface RiskMetric {
  name: string;
  value: number;
  max: number;
  status: 'good' | 'medium' | 'bad';
  icon: string;
}

@Component({
  selector: 'app-risk-analysis',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ProgressComponent],
  template: `
    <app-card className="bg-card border-border glass h-full">
      <app-card-header className="pb-2">
        <div class="flex items-center justify-between">
          <app-card-title className="text-lg font-semibold">Risk Analysis</app-card-title>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="text-xs font-medium text-accent">Low Risk</span>
          </div>
        </div>
      </app-card-header>
      <app-card-content className="space-y-4">
        <div *ngFor="let metric of riskMetrics" class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(metric.icon)" />
              </svg>
              <span class="text-sm font-medium">{{ metric.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">
                {{ metric.name === 'Sharpe Ratio' ? metric.value.toFixed(2) : metric.value + '%' }}
              </span>
              <span [class]="'text-xs px-2 py-0.5 rounded-full ' + getStatusClass(metric.status)">
                {{ getStatusText(metric.status) }}
              </span>
            </div>
          </div>
          <app-progress [value]="(metric.value / metric.max) * 100" className="h-2 bg-secondary"></app-progress>
        </div>

        <div class="pt-4 border-t border-border">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Overall Risk Score</span>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-accent">82</span>
              <span class="text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class RiskAnalysisComponent {
  riskMetrics: RiskMetric[] = [
    { name: 'Volatility', value: 18.5, max: 30, status: 'medium', icon: 'activity' },
    { name: 'Sharpe Ratio', value: 1.85, max: 3, status: 'good', icon: 'trending' },
    { name: 'Max Drawdown', value: 12.3, max: 25, status: 'good', icon: 'alert' },
    { name: 'VaR (95%)', value: 5.2, max: 10, status: 'medium', icon: 'shield' }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'good':
        return 'bg-accent/10 text-accent';
      case 'medium':
        return 'bg-chart-3/10 text-chart-3';
      case 'bad':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'good':
        return 'Excellent';
      case 'medium':
        return 'Normal';
      case 'bad':
        return 'Warning';
      default:
        return 'Unknown';
    }
  }

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      'activity': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'trending': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'alert': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    };
    return icons[icon] || '';
  }
}
