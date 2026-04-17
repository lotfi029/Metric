import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopnavComponent } from '../components/topnav/topnav.component';
import { UserService } from '@core/services/user.service';
import { DetailedUserResponse } from '@core/models/user.model';

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
  userService = inject(UserService);
  currentUser = signal<DetailedUserResponse | null>(null);

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
      },
      error: (err) => {
        console.error('Failed to load current user:', err);
      }
    });
  }
}
