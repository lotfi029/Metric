import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/services/toast.service';
import { AuthStore } from './core/auth/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>

    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="animate-toast pointer-events-auto flex items-start gap-3 px-5 py-3.5 rounded-[12px] shadow-lg min-w-[300px] max-w-[420px]"
          [ngClass]="{
            'bg-[#041627] text-white': toast.type === 'success',
            'bg-[#ba1a1a] text-white': toast.type === 'error',
            'bg-[#0055aa] text-white': toast.type === 'info'
          }"
        >
          <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="text-sm font-medium leading-snug flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="material-symbols-outlined text-base opacity-70 hover:opacity-100 flex-shrink-0 cursor-pointer bg-transparent border-0 text-inherit"
            type="button"
          >
            close
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  toastService = inject(ToastService);
  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    this.authStore.initFromStorage();
    if (this.authStore.isAuthenticated()) {
      this.authStore.startPermissionPolling();
    }
  }
}

