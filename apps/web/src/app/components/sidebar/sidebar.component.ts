import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  icon: string;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside
      [class]="'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50 ' + (collapsed ? 'w-20' : 'w-64')"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
            <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span *ngIf="!collapsed" class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FinPulse
          </span>
        </div>
      </div>

      <!-- Main Menu -->
      <nav class="flex-1 py-6 px-3 overflow-y-auto">
        <div class="space-y-1">
          <button
            *ngFor="let item of menuItems; let i = index"
            [class]="'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ' + (item.active ? 'bg-primary/10 text-primary glow-border' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')"
          >
            <svg class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" [class.text-primary]="item.active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.icon)" />
            </svg>
            <span *ngIf="!collapsed" class="font-medium truncate">{{ item.label }}</span>
            <div *ngIf="item.active && !collapsed" class="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </button>
        </div>
      </nav>

      <!-- Bottom Menu -->
      <div class="py-4 px-3 border-t border-sidebar-border">
        <div class="space-y-1">
          <button
            *ngFor="let item of bottomItems"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.icon)" />
            </svg>
            <span *ngIf="!collapsed" class="font-medium">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- Collapse Toggle -->
      <button
        (click)="collapsed = !collapsed"
        class="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <svg *ngIf="collapsed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg *ngIf="!collapsed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  collapsed = false;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'trending', label: 'Market Trends' },
    { icon: 'wallet', label: 'Portfolio' },
    { icon: 'pie', label: 'Asset Allocation' },
    { icon: 'line-chart', label: 'Analytics' },
    { icon: 'shield', label: 'Risk Management' },
    { icon: 'credit-card', label: 'Transactions' },
    { icon: 'users', label: 'Clients' },
    { icon: 'file-text', label: 'Reports' }
  ];

  bottomItems: MenuItem[] = [
    { icon: 'bell', label: 'Notifications' },
    { icon: 'settings', label: 'Settings' },
    { icon: 'help', label: 'Help' }
  ];

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      'dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'trending': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'wallet': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'pie': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
      'line-chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'bell': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'help': 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[icon] || icons['dashboard'];
  }
}
