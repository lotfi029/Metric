import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  constructor(private router: Router) { }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  showSuccess(message: string) {
    this.show(message, 'success', 3000);
  }

  showError(message: string) {
    this.show(message, 'error', 5000);
  }

  showInfo(message: string) {
    this.show(message, 'info', 3000);
  }

  dismiss(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
