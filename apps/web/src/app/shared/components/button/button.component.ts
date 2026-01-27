import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type || 'button'"
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() className?: string;
  @Input() type?: string;
  @Input() disabled?: boolean;
  @Output() onClick = new EventEmitter<Event>();

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';
    
    const variantClasses = {
      'default': 'bg-primary text-primary-foreground hover:bg-primary/90',
      'destructive': 'bg-destructive text-white hover:bg-destructive/90',
      'outline': 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
      'secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      'ghost': 'hover:bg-accent hover:text-accent-foreground',
      'link': 'text-primary underline-offset-4 hover:underline'
    };

    const sizeClasses = {
      'default': 'h-9 px-4 py-2',
      'sm': 'h-8 rounded-md gap-1.5 px-3',
      'lg': 'h-10 rounded-md px-6',
      'icon': 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${this.className || ''}`;
  }
}
