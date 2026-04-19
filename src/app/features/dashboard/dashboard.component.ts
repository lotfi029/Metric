import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { DepartmentService } from '@core/services/department.service';
import { RoleService } from '@core/services/role.service';
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
  departmentService = inject(DepartmentService);
  roleService = inject(RoleService);
  
  users = signal<UserListResponse[]>([]);
  departments = signal<any[]>([]);
  roles = signal<any[]>([]);
  isLoading = signal(true);
  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  ngOnInit() {
    this.loadUsers();
    this.loadDepartments();
    this.loadRoles();
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

  loadDepartments() {
    this.departmentService.getDepartments().subscribe({
      next: (data: any[]) => {
        this.departments.set(data);
      },
      error: (err: any) => {
        console.error('Failed to load departments:', err);
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any[]) => {
        this.roles.set(data);
      },
      error: (err: any) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  getStatusVariant(isActive: boolean) {
    return isActive ? 'active' : 'inactive';
  }
}
