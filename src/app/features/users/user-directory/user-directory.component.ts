import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { UserListResponse } from '../../../core/models/user.model';
import { RoleResponse } from '../../../core/models/role.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-directory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BadgeComponent, ConfirmDialogComponent],
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.css']
})
export class UserDirectoryComponent implements OnInit {
  users = signal<UserListResponse[]>([]);
  filteredUsers = signal<UserListResponse[]>([]);
  roles = signal<RoleResponse[]>([]);
  isLoading = signal(true);
  filterForm: FormGroup;
  currentPage = signal(1);
  pageSize = signal(10);
  showDeleteConfirm = signal(false);
  userToDelete: UserListResponse | null = null;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      roleId: [''],
      status: [''],
      search: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.users()];
    const { roleId, status, search } = this.filterForm.value;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    if (status !== '') {
      filtered = filtered.filter(u =>
        status === 'active' ? u.isActive : !u.isActive
      );
    }

    this.filteredUsers.set(filtered);
    this.currentPage.set(1);
  }

  onDeleteClick(user: UserListResponse) {
    this.userToDelete = user;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.toastService.showSuccess('User deleted successfully');
        this.loadUsers();
        this.showDeleteConfirm.set(false);
      },
      error: (err) => {
        this.toastService.showError('Failed to delete user');
      }
    });
  }

  toggleActive(user: UserListResponse) {
    const action = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    action.subscribe({
      next: () => {
        this.toastService.showSuccess(
          user.isActive ? 'User deactivated' : 'User activated'
        );
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.showError('Failed to update user status');
      }
    });
  }

  get activeCount() {
    return this.users().filter(u => u.isActive).length;
  }

  get totalCount() {
    return this.users().length;
  }

  getStatusVariant(isActive: boolean) {
    return isActive ? 'active' : 'inactive';
  }
}
