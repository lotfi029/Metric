import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { UserListResponse } from '@core/models/user.model';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BadgeComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userService = inject(UserService);
  
  users = signal<UserListResponse[]>([]);
  isLoading = signal(true);
  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data: UserListResponse[]) => {
        this.users.set(data.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load users:', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusVariant(isActive: boolean) {
    return isActive ? 'active' : 'inactive';
  }
}
