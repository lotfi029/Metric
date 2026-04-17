import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="checked ? 'bg-[#269dbe]' : 'bg-[#d5e3fc]'"
      class="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none"
      (click)="toggle()"
    >
      <span
        [ngClass]="checked ? 'translate-x-6' : 'translate-x-1'"
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      ></span>
    </button>
  `,
  styles: []
})
export class ToggleComponent {
  @Input() checked = false;
  @Output() changed = new EventEmitter<boolean>();

  toggle() {
    this.checked = !this.checked;
    this.changed.emit(this.checked);
  }
}
