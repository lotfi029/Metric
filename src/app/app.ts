import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  toastService = inject(ToastService);

  getToastClass(type: string): string {
    const baseClass = 'px-6 py-3 rounded-lg text-white font-medium shadow-lg animate-in fade-in slide-in-from-top-4 duration-300';
    switch (type) {
      case 'success':
        return `${baseClass} bg-[#6cd3f7]`;
      case 'error':
        return `${baseClass} bg-[#ba1a1a]`;
      case 'info':
        return `${baseClass} bg-[#269dbe]`;
      default:
        return baseClass;
    }
  }
}

