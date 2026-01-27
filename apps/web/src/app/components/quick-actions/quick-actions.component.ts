import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface Action {
  icon: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent],
  template: `
    <app-card className="bg-card border-border glass h-full">
      <app-card-header className="pb-2">
        <app-card-title className="text-lg font-semibold">Quick Actions</app-card-title>
      </app-card-header>
      <app-card-content>
        <div class="grid grid-cols-2 gap-2">
          <app-button
            *ngFor="let action of actions"
            variant="ghost"
            [className]="'h-auto py-4 flex flex-col items-center gap-2 ' + action.color + ' transition-all duration-200'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(action.icon)" />
            </svg>
            <span class="text-xs font-medium">{{ action.label }}</span>
          </app-button>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class QuickActionsComponent {
  actions: Action[] = [
    { icon: 'arrow-up-right', label: 'Buy', color: 'bg-accent/10 text-accent hover:bg-accent/20' },
    { icon: 'arrow-down-left', label: 'Sell', color: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
    { icon: 'refresh', label: 'Rebalance', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
    { icon: 'send', label: 'Transfer', color: 'bg-chart-3/10 text-chart-3 hover:bg-chart-3/20' },
    { icon: 'file-text', label: 'Reports', color: 'bg-chart-5/10 text-chart-5 hover:bg-chart-5/20' },
    { icon: 'download', label: 'Export', color: 'bg-muted text-muted-foreground hover:bg-muted/80' }
  ];

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      'arrow-up-right': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'arrow-down-left': 'M17 17l-8-8m0 0H6m3 0v3m8-3V6m0 0h-3m3 0l-8 8',
      'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'send': 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'download': 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
    };
    return icons[icon] || '';
  }
}
