import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card"
      [class]="'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card-header"
      [class]="'@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardHeaderComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card-title"
      [class]="'leading-none font-semibold ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardTitleComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card-description"
      [class]="'text-muted-foreground text-sm ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardDescriptionComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card-content"
      [class]="'px-6 ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardContentComponent {
  @Input() className?: string;
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-slot="card-footer"
      [class]="'flex items-center px-6 [.border-t]:pt-6 ' + (className || '')"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardFooterComponent {
  @Input() className?: string;
}
