import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div class="mb-6">
          <h2 class="text-xl font-['Manrope'] font-bold text-[#041627] mb-2">{{ title }}</h2>
          <p class="text-[#515f74]">{{ message }}</p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            (click)="cancel()"
            class="btn-secondary px-6 py-2"
          >
            Cancel
          </button>
          <button
            (click)="confirm()"
            class="btn-primary px-6 py-2"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.cancelled.emit();
  }
}
