import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/http/permission.service';
import { DetailedUserResponse } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user = signal<DetailedUserResponse | null>(null);
  permissionsByGroup = signal<{ [key: string]: string[] }>({});
  isLoading = signal(true);

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
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
      },
    });
  }

  loadPermissions(userId: string) {
    this.permissionService.getUserEffective(userId).subscribe({
      next: (response) => {
        this.groupPermissions(response.permissions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load permissions:', err);
        this.isLoading.set(false);
      },
    });
  }

  groupPermissions(permissionNames: string[]) {
    const grouped: { [key: string]: string[] } = {};
    permissionNames.forEach((name) => {
      // Extract group from permission name (e.g., "users.read" -> "Users")
      const [group] = name.split('.');
      const groupLabel = group.charAt(0).toUpperCase() + group.slice(1);

      if (!grouped[groupLabel]) {
        grouped[groupLabel] = [];
      }
      grouped[groupLabel].push(name);
    });
    this.permissionsByGroup.set(grouped);
  }

  getInitials(user: DetailedUserResponse): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
