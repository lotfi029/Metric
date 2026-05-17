import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormError } from '../../../core/http/error-handler.service';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (error) {
      <div class="alert-error flex items-start gap-3 mb-4">
        <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">error</span>
        <div class="flex-1">
          <p class="font-semibold text-sm mb-0.5">{{ error.generalMessage }}</p>
          @if (error.fieldErrors.length) {
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5 opacity-90">
              @for (fe of error.fieldErrors; track fe.field) {
                <li><strong>{{ fe.field }}</strong>: {{ fe.message }}</li>
              }
            </ul>
          }
        </div>
        <button
          type="button"
          (click)="dismissed.emit()"
          class="material-symbols-outlined text-sm opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-0 text-inherit flex-shrink-0"
        >
          close
        </button>
      </div>
    }
  `,
})
export class ErrorDisplayComponent {
  @Input() error: FormError | null = null;
  @Output() dismissed = new EventEmitter<void>();
}
