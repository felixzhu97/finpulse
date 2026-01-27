import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full ' + (className || '')"
    >
      <div
        class="bg-primary h-full w-full flex-1 transition-all"
        [style.transform]="'translateX(-' + (100 - (value || 0)) + '%)'"
      ></div>
    </div>
  `,
  styles: []
})
export class ProgressComponent {
  @Input() value?: number;
  @Input() className?: string;
}
