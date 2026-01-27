import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'relative flex size-8 shrink-0 overflow-hidden rounded-full ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class AvatarComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="src"
      [alt]="alt"
      [class]="'aspect-square size-full ' + (className || '')"
    />
  `,
  styles: []
})
export class AvatarImageComponent {
  @Input() src?: string;
  @Input() alt?: string;
  @Input() className?: string;
}

@Component({
  selector: 'app-avatar-fallback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'bg-muted flex size-full items-center justify-center rounded-full ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class AvatarFallbackComponent {
  @Input() className?: string;
}
