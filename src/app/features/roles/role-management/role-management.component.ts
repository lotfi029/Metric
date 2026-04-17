import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '@core/services/permission.service';
import { RoleResponse } from '@core/models/role.model';
import { PermissionResponse } from '@core/models/permission.model';
import { ToastService } from '@core/services/toast.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ToggleComponent } from '@shared/components/toggle/toggle.component';
import { RoleService } from '@app/core/services/role.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ConfirmDialogComponent, ToggleComponent],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  roles = signal<RoleResponse[]>([]);
  selectedRole = signal<RoleResponse | null>(null);
  allPermissions = signal<PermissionResponse[]>([]);
  rolePermissions = signal<PermissionResponse[]>([]);
  permissionsByGroup = signal<{ [key: string]: PermissionResponse[] }>({});
  isLoading = signal(true);

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  roleForm: FormGroup;

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPermissions() {
    this.permissionService.getPermissions().subscribe({
      next: (data) => {
        this.allPermissions.set(data);
        this.groupPermissions(data);
      },
      error: (err) => {
        console.error('Failed to load permissions:', err);
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

  selectRole(role: RoleResponse) {
    this.selectedRole.set(role);
    this.loadRolePermissions(role.id);
  }

  loadRolePermissions(roleId: string) {
    this.permissionService.getRolePermissions(roleId).subscribe({
      next: (data) => {
        this.rolePermissions.set(data);
      },
      error: (err) => {
        console.error('Failed to load role permissions:', err);
      }
    });
  }

  isPermissionAssigned(permId: number): boolean {
    return this.rolePermissions().some(p => p.id === permId);
  }

  togglePermission(permission: PermissionResponse) {
    if (!this.selectedRole()) return;

    if (this.isPermissionAssigned(permission.id)) {
      this.permissionService.deletePermission(this.selectedRole()!.id, { permissionName: permission.name }).subscribe({
        next: () => {
          this.toastService.showSuccess(`${permission.displayName} removed`);
          this.loadRolePermissions(this.selectedRole()!.id);
        },
        error: (err) => {
          this.toastService.showError('Failed to remove permission');
        }
      });
    } else {
      this.permissionService.createPermission(this.selectedRole()!.id, { permissionName: permission.name }).subscribe({
        next: () => {
          this.toastService.showSuccess(`${permission.displayName} added`);
          this.loadRolePermissions(this.selectedRole()!.id);
        },
        error: (err) => {
          this.toastService.showError('Failed to add permission');
        }
      });
    }
  }

  openCreateModal() {
    this.roleForm.reset();
    this.showCreateModal.set(true);
  }

  openEditModal() {
    if (!this.selectedRole()) return;
    this.roleForm.patchValue({ roleName: this.selectedRole()!.roleName });
    this.showEditModal.set(true);
  }

  openDeleteConfirm() {
    this.showDeleteConfirm.set(true);
  }

  saveRole() {
    if (this.roleForm.invalid) return;

    if (this.showCreateModal()) {
      this.roleService.createRole({ roleName: this.roleForm.get('roleName')?.value }).subscribe({
        next: () => {
          this.toastService.showSuccess('Role created successfully');
          this.showCreateModal.set(false);
          this.loadRoles();
        },
        error: (err) => {
          this.toastService.showError('Failed to create role');
        }
      });
    } else if (this.showEditModal() && this.selectedRole()) {
      this.roleService.updateRole({
        roleId: this.selectedRole()!.id,
        newRoleName: this.roleForm.get('roleName')?.value
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Role updated successfully');
          this.showEditModal.set(false);
          this.loadRoles();
        },
        error: (err) => {
          this.toastService.showError('Failed to update role');
        }
      });
    }
  }

  deleteRole() {
    if (!this.selectedRole()) return;

    this.roleService.deleteRole(this.selectedRole()!.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Role deleted successfully');
        this.showDeleteConfirm.set(false);
        this.selectedRole.set(null);
        this.loadRoles();
      },
      error: (err) => {
        this.toastService.showError('Failed to delete role');
      }
    });
  }
}
