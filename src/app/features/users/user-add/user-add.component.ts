import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { DepartmentService } from '../../../core/services/department.service';
import { PermissionService } from '../../../core/services/permission.service';
import { RoleResponse } from '../../../core/models/role.model';
import { DepartmentResponse } from '../../../core/models/department.model';
import { PermissionResponse } from '../../../core/models/permission.model';
import { ToastService } from '../../../core/services/toast.service';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToggleComponent],
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {
  userForm: FormGroup;
  roles = signal<RoleResponse[]>([]);
  departments = signal<DepartmentResponse[]>([]);
  permissions = signal<PermissionResponse[]>([]);
  permissionsByGroup = signal<{ [key: string]: PermissionResponse[] }>({});
  isLoading = signal(false);
  isSaving = signal(false);

  selectedPermissions = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
    private permissionService: PermissionService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roleId: [null],
      departmentId: [null]
    });
  }

  ngOnInit() {
    this.isLoading.set(true);
    Promise.all([
      this.loadRoles(),
      this.loadDepartments(),
      this.loadPermissions()
    ]).finally(() => this.isLoading.set(false));
  }

  loadRoles() {
    return new Promise((resolve) => {
      this.roleService.getRoles().subscribe({
        next: (data) => {
          this.roles.set(data);
          resolve(true);
        },
        error: (err) => {
          console.error('Failed to load roles:', err);
          resolve(true);
        }
      });
    });
  }

  loadDepartments() {
    return new Promise((resolve) => {
      this.departmentService.getDepartments().subscribe({
        next: (data) => {
          this.departments.set(data);
          resolve(true);
        },
        error: (err) => {
          console.error('Failed to load departments:', err);
          resolve(true);
        }
      });
    });
  }

  loadPermissions() {
    return new Promise((resolve) => {
      this.permissionService.getPermissions().subscribe({
        next: (data) => {
          this.permissions.set(data);
          this.groupPermissions(data);
          resolve(true);
        },
        error: (err) => {
          console.error('Failed to load permissions:', err);
          resolve(true);
        }
      });
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

  togglePermission(permissionName: string) {
    this.selectedPermissions.update(perms => {
      const index = perms.indexOf(permissionName);
      if (index >= 0) {
        return perms.filter((_, i) => i !== index);
      }
      return [...perms, permissionName];
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    this.userService.createUser(this.userForm.value).subscribe({
      next: (response) => {
        this.toastService.showSuccess('User created successfully');
        this.router.navigate(['/users', response.userId]);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.showError('Failed to create user');
      }
    });
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  isPermissionSelected(name: string): boolean {
    return this.selectedPermissions().includes(name);
  }
}
