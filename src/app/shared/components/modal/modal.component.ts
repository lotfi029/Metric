import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-['Manrope'] font-bold text-[#041627]">{{ title }}</h2>
          <button
            (click)="closeModal()"
            class="text-[#515f74] hover:text-[#041627]"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  @Input() title = '';
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }
}
