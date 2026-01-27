import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent, AvatarImageComponent, AvatarFallbackComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent
  ],
  template: `
    <header class="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Search -->
        <div class="relative w-96">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <app-input
            placeholder="Search stocks, funds, assets..."
            className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary/20"
          ></app-input>
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">⌘K</kbd>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-4">
          <!-- Market Status -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span class="text-sm text-accent font-medium">Market Open</span>
          </div>

          <!-- Language -->
          <app-button variant="ghost" size="icon" className="text-muted-foreground">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </app-button>

          <!-- Theme Toggle -->
          <app-button
            variant="ghost"
            size="icon"
            (onClick)="toggleDarkMode()"
            className="text-muted-foreground"
          >
            <svg *ngIf="darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg *ngIf="!darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </app-button>

          <!-- Notifications -->
          <app-button variant="ghost" size="icon" className="relative text-muted-foreground">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <app-badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">3</app-badge>
          </app-button>

          <!-- Profile -->
          <div class="relative">
            <app-button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
              <app-avatar className="w-8 h-8 border-2 border-primary/50">
                <app-avatar-image src="/professional-asian-man-avatar.png"></app-avatar-image>
                <app-avatar-fallback className="bg-primary/20 text-primary">JC</app-avatar-fallback>
              </app-avatar>
              <div class="text-left hidden lg:block">
                <p class="text-sm font-medium">John Chen</p>
                <p class="text-xs text-muted-foreground">Senior Analyst</p>
              </div>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </app-button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  darkMode = true;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark', this.darkMode);
  }
}
