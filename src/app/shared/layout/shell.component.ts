import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopnavComponent } from '../components/topnav/topnav.component';
import { DetailedUserResponse } from '@core/models/user.model';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopnavComponent],
  template: `
    <div class="flex h-screen bg-[#f2f4f6]">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-topnav [currentUser]="currentUser()"></app-topnav>
        <div class="flex-1 overflow-auto ml-64 mt-16 p-8">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ShellComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  currentUser = computed<DetailedUserResponse | null>(() => {
    const user = this.authStore.user();
    if (!user) return null;
    const parts = user.userName.split(/[.\s_-]+/).filter(Boolean);
    return {
      id: user.userId,
      firstName: parts[0] ?? user.userName,
      lastName: parts.slice(1).join(' ') || parts[0] || user.userName,
      userName: user.userName,
      email: user.email,
      isActive: user.isActive,
      createdAt: '',
      lastLoginAt: null,
    } as DetailedUserResponse;
  });

  ngOnInit() {
    this.authStore.initFromStorage();
  }
}
