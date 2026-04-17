import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '@core/services/department.service';
import { UserService } from '@core/services/user.service';
import { DepartmentResponse } from '@core/models/department.model';
import { UserListResponse } from '@core/models/user.model';
import { ToastService } from '@core/services/toast.service';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {
  departments = signal<DepartmentResponse[]>([]);
  selectedDept = signal<DepartmentResponse | null>(null);
  deptUsers = signal<UserListResponse[]>([]);
  allUsers = signal<UserListResponse[]>([]);
  isLoading = signal(true);

  deptForm: FormGroup;
  showCreateModal = signal(false);
  showDeleteConfirm = signal(false);
  newUserInput = signal('');

  constructor(
    private deptService: DepartmentService,
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.deptForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadDepartments();
    this.loadUsers();
  }

  loadDepartments() {
    this.deptService.getDepartments().subscribe({
      next: (data) => {
        this.departments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers.set(data);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  selectDept(dept: DepartmentResponse) {
    this.selectedDept.set(dept);
    this.deptForm.patchValue({
      name: dept.name,
      description: dept.description,
      isActive: dept.isActive
    });
    this.loadDeptUsers(dept.id);
  }

  loadDeptUsers(deptId: string) {
    this.deptService.getDepartmentUsers(deptId).subscribe({
      next: (data) => {
        this.deptUsers.set(data);
      },
      error: (err) => {
        console.error('Failed to load department users:', err);
      }
    });
  }

  saveDeptChanges() {
    if (!this.selectedDept() || this.deptForm.invalid) return;

    const updateReq = {
      name: this.deptForm.get('name')?.value,
      description: this.deptForm.get('description')?.value
    };

    this.deptService.updateDepartment(this.selectedDept()!.id, updateReq).subscribe({
      next: () => {
        this.toastService.showSuccess('Department updated successfully');
        this.loadDepartments();
      },
      error: (err) => {
        this.toastService.showError('Failed to update department');
      }
    });
  }

  addUserToDept() {
    if (!this.selectedDept() || !this.newUserInput()) return;

    this.deptService.addUserToDepartment(this.selectedDept()!.id, { userId: this.newUserInput() }).subscribe({
      next: () => {
        this.toastService.showSuccess('User added to department');
        this.newUserInput.set('');
        this.loadDeptUsers(this.selectedDept()!.id);
      },
      error: (err) => {
        this.toastService.showError('Failed to add user');
      }
    });
  }

  removeUserFromDept(userId: string) {
    if (!this.selectedDept()) return;

    this.deptService.removeUserFromDepartment(this.selectedDept()!.id, { userId }).subscribe({
      next: () => {
        this.toastService.showSuccess('User removed from department');
        this.loadDeptUsers(this.selectedDept()!.id);
      },
      error: (err) => {
        this.toastService.showError('Failed to remove user');
      }
    });
  }

  createDept() {
    if (this.deptForm.invalid) return;

    this.deptService.createDepartment({
      name: this.deptForm.get('name')?.value,
      description: this.deptForm.get('description')?.value
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Department created successfully');
        this.showCreateModal.set(false);
        this.deptForm.reset();
        this.loadDepartments();
      },
      error: (err) => {
        this.toastService.showError('Failed to create department');
      }
    });
  }

  deleteDept() {
    if (!this.selectedDept()) return;

    this.deptService.deleteDepartment(this.selectedDept()!.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Department deleted successfully');
        this.showDeleteConfirm.set(false);
        this.selectedDept.set(null);
        this.loadDepartments();
      },
      error: (err) => {
        this.toastService.showError('Failed to delete department');
      }
    });
  }
}
