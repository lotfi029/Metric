import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/services/permission.service';
import { DetailedUserResponse } from '../../../core/models/user.model';
import { PermissionResponse } from '../../../core/models/permission.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user = signal<DetailedUserResponse | null>(null);
  permissions = signal<PermissionResponse[]>([]);
  permissionsByGroup = signal<{ [key: string]: PermissionResponse[] }>({});
  isLoading = signal(true);

  constructor(
    private userService: UserService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loadPermissions(user.id);
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPermissions(userId: string) {
    this.permissionService.getUserPermissions(userId).subscribe({
      next: (perms) => {
        this.permissions.set(perms);
        this.groupPermissions(perms);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load permissions:', err);
        this.isLoading.set(false);
      }
    });
  }

  groupPermissions(perms: PermissionResponse[]) {
    const grouped: { [key: string]: PermissionResponse[] } = {};
    perms.forEach(p => {
      if (!grouped[p.group]) {
        grouped[p.group] = [];
      }
      grouped[p.group].push(p);
    });
    this.permissionsByGroup.set(grouped);
  }

  getInitials(user: DetailedUserResponse): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
