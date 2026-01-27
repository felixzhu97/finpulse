import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface Transaction {
  type: 'buy' | 'sell';
  symbol: string;
  name: string;
  amount: string;
  price: string;
  time: string;
  status: 'completed' | 'pending';
}

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, BadgeComponent],
  template: `
    <app-card className="bg-card border-border glass">
      <app-card-header className="flex flex-row items-center justify-between pb-2">
        <app-card-title className="text-lg font-semibold">Recent Transactions</app-card-title>
        <app-button variant="ghost" size="sm" className="text-primary">View All</app-button>
      </app-card-header>
      <app-card-content>
        <div class="space-y-3">
          <div
            *ngFor="let tx of transactions"
            class="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center ' + (tx.type === 'buy' ? 'bg-accent/10' : 'bg-destructive/10')">
                <svg *ngIf="tx.type === 'buy'" class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <svg *ngIf="tx.type === 'sell'" class="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17l5-5m0 0l-5-5m5 5H6" />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-sm">{{ tx.symbol }}</p>
                  <app-badge [variant]="tx.type === 'buy' ? 'default' : 'destructive'" [className]="'text-xs ' + (tx.type === 'buy' ? 'bg-accent/10 text-accent hover:bg-accent/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20')">
                    {{ tx.type === 'buy' ? 'Buy' : 'Sell' }}
                  </app-badge>
                </div>
                <p class="text-xs text-muted-foreground">{{ tx.name }} · {{ tx.amount }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-sm">{{ tx.price }}</p>
              <p class="text-xs text-muted-foreground">{{ tx.time }}</p>
            </div>
            <app-button variant="ghost" size="icon" className="ml-2 text-muted-foreground">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </app-button>
          </div>
        </div>
      </app-card-content>
    </app-card>
  `,
  styles: []
})
export class RecentTransactionsComponent {
  transactions: Transaction[] = [
    {
      type: 'buy',
      symbol: 'NVDA',
      name: 'NVIDIA',
      amount: '100 shares',
      price: '¥62,847',
      time: 'Today 14:32',
      status: 'completed'
    },
    {
      type: 'sell',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      amount: '50 shares',
      price: '¥65,234',
      time: 'Today 11:15',
      status: 'completed'
    },
    {
      type: 'buy',
      symbol: 'TSLA',
      name: 'Tesla',
      amount: '30 shares',
      price: '¥53,456',
      time: 'Yesterday 15:47',
      status: 'completed'
    },
    {
      type: 'sell',
      symbol: 'MSFT',
      name: 'Microsoft',
      amount: '20 shares',
      price: '¥54,238',
      time: 'Yesterday 10:23',
      status: 'completed'
    },
    {
      type: 'buy',
      symbol: 'BABA',
      name: 'Alibaba',
      amount: '200 shares',
      price: '¥112,567',
      time: '01/15',
      status: 'pending'
    }
  ];
}
