import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="getBadgeClasses()"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() className?: string;

  getBadgeClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden';
    
    const variantClasses = {
      'default': 'border-transparent bg-primary text-primary-foreground',
      'secondary': 'border-transparent bg-secondary text-secondary-foreground',
      'destructive': 'border-transparent bg-destructive text-white',
      'outline': 'text-foreground'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${this.className || ''}`;
  }
}
