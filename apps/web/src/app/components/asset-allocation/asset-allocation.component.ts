import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';

interface AssetData {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-asset-allocation',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  template: `
    <app-card className="bg-card border-border glass h-full">
      <app-card-header className="pb-2">
        <app-card-title className="text-lg font-semibold">Asset Allocation</app-card-title>
      </app-card-header>
      <app-card-content>
        <div class="h-[200px] relative flex items-center justify-center">
          <!-- Simple pie chart representation -->
          <svg class="w-full h-full" viewBox="0 0 200 200">
            <g *ngFor="let item of data; let i = index">
              <path
                [attr.d]="getPiePath(item, i)"
                [attr.fill]="item.color"
                [attr.stroke]="'oklch(0.14 0.015 260)'"
                stroke-width="2"
              />
            </g>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
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
  data: AssetData[] = [
    { name: 'Stocks', value: 45, color: 'oklch(0.65 0.2 250)' },
    { name: 'Bonds', value: 25, color: 'oklch(0.7 0.22 160)' },
    { name: 'Funds', value: 15, color: 'oklch(0.75 0.18 80)' },
    { name: 'Cash', value: 10, color: 'oklch(0.7 0.15 300)' },
    { name: 'Other', value: 5, color: 'oklch(0.6 0.02 260)' }
  ];

  getPiePath(item: AssetData, index: number): string {
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    const startAngle = this.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
    const endAngle = startAngle + (item.value / total) * 360;
    
    const centerX = 100;
    const centerY = 100;
    const radius = 85;
    const innerRadius = 60;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }
}
