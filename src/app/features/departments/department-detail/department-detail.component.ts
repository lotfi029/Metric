import { CommonModule } from '@angular/common';
import { Component, Inject, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse, EmployeeListResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { EmployeeService } from '../../../core/http/employee.service';
import { HasPermissionDirective } from '../../../shared/directives';

type PickerData = {
  title: string;
  label: string;
  employees?: EmployeeListResponse[];
  departments?: DepartmentResponse[];
  emptyText: string;
};

@Component({
  selector: 'app-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      @if (data.employees?.length) {
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ data.label }}</mat-label>
          <mat-select [formControl]="control">
            @for (employee of data.employees; track employee.id) {
              <mat-option [value]="employee.appUserId || employee.id">
                {{ employee.firstName }} {{ employee.lastName }} · {{ employee.jobTitle }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      } @else if (data.departments?.length) {
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ data.label }}</mat-label>
          <mat-select [formControl]="control">
            @for (department of data.departments; track department.id) {
              <mat-option [value]="department.id">{{ department.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      } @else {
        <p class="empty">{{ data.emptyText }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!control.value" (click)="confirm()">
        Confirm
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full {
        width: 100%;
        min-width: min(460px, 76vw);
      }
      .empty {
        color: #64748b;
        margin: 8px 0 2px;
      }
    `,
  ],
})
export class PickerDialogComponent {
  readonly control = new FormControl<string | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: PickerData,
    private readonly dialogRef: MatDialogRef<PickerDialogComponent>,
  ) {}

  confirm(): void {
    this.dialogRef.close(this.control.value);
  }
}

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HasPermissionDirective,
  ],
  template: `
    @if (isLoading()) {
      <div class="loading"><mat-spinner diameter="36" /> Loading department</div>
    } @else if (department(); as dept) {
      <header class="hero">
        <div>
          <a class="back" href="/departments">Departments</a>
          <h1>{{ dept.name }}</h1>
          <p>{{ dept.description || 'No description has been added yet.' }}</p>
        </div>
        <div class="meta">
          <span>Created</span>
          <strong>{{ dept.createdAt | date: 'mediumDate' }}</strong>
        </div>
      </header>

      <div class="layout">
        <aside class="panel">
          <div class="section-title">
            <mat-icon>supervisor_account</mat-icon>
            <h2>Department Head</h2>
          </div>
          @if (departmentHead(); as head) {
            <div class="person-card">
              <span class="avatar">{{ initials(head) }}</span>
              <div>
                <strong>{{ displayEmployee(head) }}</strong>
                <span>{{ head.jobTitle || 'No title' }}</span>
              </div>
            </div>
            <button
              mat-stroked-button
              color="warn"
              *appHasPermission="PERMISSIONS.departments.assignHead"
              [disabled]="isSaving()"
              (click)="removeHead()"
            >
              Remove Head
            </button>
          } @else {
            <div class="empty-state compact">
              <mat-icon>warning</mat-icon>
              <strong>No Department Head</strong>
              <span>The Manager will act as department head until one is assigned.</span>
            </div>
            <button
              mat-raised-button
              color="primary"
              *appHasPermission="PERMISSIONS.departments.assignHead"
              [disabled]="isSaving()"
              (click)="assignHead()"
            >
              Assign Head
            </button>
          }
        </aside>

        <section class="panel">
          <header class="members-head">
            <div>
              <h2>Members</h2>
              <p>{{ members().length }} employees in this department</p>
            </div>
            <button
              mat-raised-button
              color="primary"
              *appHasPermission="PERMISSIONS.departments.assignToUser"
              [disabled]="isSaving()"
              (click)="addEmployee()"
            >
              <mat-icon>person_add</mat-icon>
              Add Employee
            </button>
          </header>

          <div class="member-table">
            <div class="member-row table-head">
              <span>Name</span><span>Job Title</span><span>Status</span><span>Actions</span>
            </div>
            @for (member of members(); track member.id) {
              <div class="member-row">
                <div class="person-card inline">
                  <span class="avatar">{{ initials(member) }}</span>
                  <div>
                    <strong>{{ displayEmployee(member) }}</strong>
                    <span>{{ member.email || 'No email' }}</span>
                  </div>
                </div>
                <span>{{ member.jobTitle || 'No title' }}</span>
                <span class="status" [class.off]="!member.isActive">{{
                  member.isActive ? 'Active' : 'Inactive'
                }}</span>
                <div class="row-actions">
                  <button
                    mat-button
                    *appHasPermission="PERMISSIONS.departments.removeFromUser"
                    [disabled]="isSaving()"
                    (click)="removeEmployee(member)"
                  >
                    Remove
                  </button>
                  <button
                    mat-button
                    *appHasPermission="PERMISSIONS.departments.moveUser"
                    [disabled]="isSaving()"
                    (click)="moveEmployee(member)"
                  >
                    Move
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <mat-icon>groups</mat-icon>
                <strong>This department has no members yet.</strong>
                <span>Add employees to get started.</span>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        color: #172033;
      }
      .loading {
        min-height: 50vh;
        display: grid;
        place-items: center;
        gap: 12px;
        color: #64748b;
      }
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        padding: 22px;
        margin-bottom: 18px;
        border: 1px solid #dbe5ef;
        border-radius: 8px;
        background: linear-gradient(135deg, #ffffff 0%, #f4f8fb 100%);
      }
      .back {
        color: #2563eb;
        text-decoration: none;
        font-weight: 700;
        font-size: 13px;
      }
      h1,
      h2 {
        margin: 0;
        letter-spacing: 0;
      }
      h1 {
        margin-top: 8px;
        font-size: 30px;
      }
      p {
        margin: 6px 0 0;
        color: #64748b;
      }
      .meta {
        display: grid;
        gap: 4px;
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #fff;
        min-width: 140px;
      }
      .meta span,
      .person-card span,
      .table-head,
      .empty-state span {
        color: #64748b;
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(260px, 340px) 1fr;
        gap: 18px;
        align-items: start;
      }
      .panel {
        background: #fff;
        border: 1px solid #dbe5ef;
        border-radius: 8px;
        padding: 18px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      }
      .section-title,
      .members-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .section-title {
        justify-content: flex-start;
      }
      .section-title mat-icon {
        color: #2563eb;
      }
      .person-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        margin-bottom: 14px;
      }
      .person-card.inline {
        padding: 0;
        border: 0;
        background: transparent;
        margin: 0;
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-weight: 800;
      }
      .member-table {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .member-row {
        display: grid;
        grid-template-columns: minmax(240px, 1.5fr) 1fr 0.7fr 180px;
        gap: 14px;
        align-items: center;
        padding: 12px 14px;
        border-bottom: 1px solid #eef2f7;
      }
      .member-row:last-child {
        border-bottom: 0;
      }
      .table-head {
        background: #f8fafc;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
      }
      .status {
        width: fit-content;
        padding: 5px 10px;
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        font-weight: 800;
        font-size: 12px;
      }
      .status.off {
        background: #fee2e2;
        color: #991b1b;
      }
      .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 4px;
      }
      .empty-state {
        display: grid;
        place-items: center;
        gap: 8px;
        padding: 42px 16px;
        color: #64748b;
        text-align: center;
      }
      .empty-state.compact {
        padding: 22px 12px;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        margin-bottom: 14px;
      }
      .empty-state mat-icon {
        color: #94a3b8;
      }
      @media (max-width: 980px) {
        .layout,
        .hero {
          grid-template-columns: 1fr;
          display: grid;
        }
        .member-row {
          grid-template-columns: 1fr;
        }
        .row-actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DepartmentDetailComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly department = signal<DepartmentResponse | null>(null);
  readonly members = signal<EmployeeListResponse[]>([]);
  readonly departmentHead = signal<EmployeeListResponse | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly memberUserIds = computed(
    () => new Set(this.members().map((member) => member.appUserId || member.id)),
  );

  constructor() {
    void this.load();
  }

  async assignHead(): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const selectedUserId = await this.pickEmployee({
      title: 'Assign Department Head',
      label: 'Employee',
      employees: this.members(),
      emptyText:
        'No employees in this department. Add employees before assigning a department head.',
    });
    if (!selectedUserId) return;

    const selectedMember = this.members().find((m) => (m.appUserId || m.id) === selectedUserId);
    const userId = selectedMember?.appUserId || selectedMember?.id || selectedUserId;
    await this.runMutation(
      () => this.departmentService.assignHead(dept.id, userId),
      'Department head assigned.',
    );
  }

  initials(employee: EmployeeListResponse): string {
    return `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  }

  displayEmployee(employee: EmployeeListResponse): string {
    return (
      `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
      employee.email ||
      'Unnamed employee'
    );
  }

  async removeHead(): Promise<void> {
    const dept = this.department();
    if (!dept) return;
    await this.runMutation(
      () => this.departmentService.removeHead(dept.id),
      'Department head removed.',
    );
  }

  async addEmployee(): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const employees = await firstValueFrom(this.employeeService.getAll()).catch(() => []);
    const available = employees.filter(
      (employee) => !this.memberUserIds().has(employee.appUserId || employee.id),
    );
    const selectedUserId = await this.pickEmployee({
      title: 'Add Employee',
      label: 'Employee',
      employees: available,
      emptyText: 'All active employees are already in this department.',
    });
    if (!selectedUserId) return;

    await this.runMutation(
      () => this.departmentService.addEmployee(dept.id, selectedUserId),
      'Employee added to department.',
    );
  }

  async removeEmployee(member: EmployeeListResponse): Promise<void> {
    const dept = this.department();
    if (!dept) return;
    await this.runMutation(
      () => this.departmentService.removeEmployee(dept.id, member.appUserId || member.id),
      'Employee removed from department.',
    );
  }

  async moveEmployee(member: EmployeeListResponse): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const departments = (
      await firstValueFrom(this.departmentService.getAll()).catch(() => [])
    ).filter((item) => item.id !== dept.id);
    const targetDepartmentId = await this.pickDepartment({
      title: 'Move Employee',
      label: 'Target department',
      departments,
      emptyText: 'No other departments are available.',
    });
    if (!targetDepartmentId) return;

    await this.runMutation(
      () =>
        this.departmentService.moveEmployee(
          dept.id,
          member.appUserId || member.id,
          targetDepartmentId,
        ),
      'Employee moved.',
    );
  }

  private async pickEmployee(data: PickerData): Promise<string | null> {
    return firstValueFrom(this.dialog.open(PickerDialogComponent, { data }).afterClosed());
  }

  private async pickDepartment(data: PickerData): Promise<string | null> {
    return firstValueFrom(this.dialog.open(PickerDialogComponent, { data }).afterClosed());
  }

  private async runMutation(
    request: () => ReturnType<DepartmentService['assignHead']>,
    success: string,
  ): Promise<void> {
    this.isSaving.set(true);
    try {
      await firstValueFrom(request());
      this.snackBar.open(success, 'Dismiss', { duration: 2500 });
      await this.load(false);
    } catch (error: any) {
      this.snackBar.open(error?.error?.title || 'Department update failed.', 'Dismiss', {
        duration: 4000,
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  private async load(showSpinner = true): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    if (showSpinner) this.isLoading.set(true);
    const [dept, members] = await Promise.all([
      firstValueFrom(this.departmentService.getById(id)).catch(() => null),
      firstValueFrom(this.departmentService.getMembers(id)).catch(() => []),
    ]);
    this.department.set(dept);
    this.members.set(members);

    // Fetch department head employee details if departmentHeadId exists
    if (dept?.departmentHeadId) {
      // First, try to find the head in the members list
      let head: EmployeeListResponse | null =
        members.find(
          (m) => m.id === dept.departmentHeadId || m.appUserId === dept.departmentHeadId,
        ) || null;

      // If not found in members, try to fetch it by ID
      if (!head) {
        const response = await firstValueFrom(
          this.employeeService.getById(dept.departmentHeadId),
        ).catch(() => null);
        head = response || null;
      }

      this.departmentHead.set(head);
    } else {
      this.departmentHead.set(null);
    }

    this.isLoading.set(false);
  }
}
