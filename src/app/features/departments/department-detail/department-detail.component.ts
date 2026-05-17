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
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse, EmployeeListResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { EmployeeService } from '../../../core/http/employee.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';
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
                {{ employee.firstName }} {{ employee.lastName }} - {{ employee.jobTitle || 'No title' }}
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
    MatProgressSpinnerModule,
    HasPermissionDirective,
  ],
  template: `
    @if (isLoading()) {
      <div class="loading"><mat-spinner diameter="36" /> Loading department</div>
    } @else if (department(); as dept) {
      <header class="department-hero">
        <div>
          <a class="back" href="/departments">Back to departments</a>
          <h1>{{ dept.name }}</h1>
          <p>{{ dept.description || 'No description has been added yet.' }}</p>
        </div>
        <div class="hero-stats">
          <article>
            <span>Members</span>
            <strong>{{ visibleMembers().length }}</strong>
          </article>
          <article>
            <span>Created</span>
            <strong>{{ dept.createdAt | date: 'mediumDate' }}</strong>
          </article>
        </div>
      </header>

      <div class="layout">
        <aside class="surface head-panel">
          <header class="section-title">
            <span class="section-mark">DH</span>
            <div>
              <h2>Department Head</h2>
              <p>Assigned from any employee in the company.</p>
            </div>
          </header>
          @if (departmentHead(); as head) {
            <div class="person-card head-card">
              <span class="avatar">{{ initials(head) }}</span>
              <div>
                <strong>{{ displayEmployee(head) }}</strong>
                <span>{{ head.jobTitle || 'No title' }}</span>
                <small>{{ head.email || 'No email' }}</small>
              </div>
            </div>
            <div class="action-row">
              <button
                mat-stroked-button
                *appHasPermission="PERMISSIONS.departments.assignHead"
                [disabled]="isSaving()"
                (click)="assignHead()"
              >
                Change head
              </button>
              <button
                mat-stroked-button
                color="warn"
                *appHasPermission="PERMISSIONS.departments.assignHead"
                [disabled]="isSaving()"
                (click)="removeHead()"
              >
                Remove head
              </button>
            </div>
          } @else {
            <div class="empty-state compact">
              <span class="section-mark muted">--</span>
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

        <section class="surface">
          <header class="members-head">
            <div>
              <h2>Members</h2>
              <p>{{ visibleMembers().length }} employees in this department</p>
            </div>
            <button
              mat-raised-button
              color="primary"
              *appHasPermission="PERMISSIONS.departments.assignToUser"
              [disabled]="isSaving()"
              (click)="addEmployee()"
            >
              Add Employee
            </button>
          </header>

          <div class="member-table">
            <div class="member-row table-head">
              <span>Name</span><span>Job Title</span><span>Status</span><span>Actions</span>
            </div>
            @for (member of visibleMembers(); track member.id) {
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
                <span class="section-mark muted">0</span>
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
        --dept-border: #d9e2ec;
        --dept-soft: #f7fafc;
        --dept-muted: #64748b;
        --dept-text: #172033;
        --dept-primary: #2563eb;
        --dept-primary-soft: #e8f1ff;
        --dept-success-soft: #ecfdf3;
        --dept-success: #166534;
        display: block;
        color: var(--dept-text);
      }
      .loading {
        min-height: 50vh;
        display: grid;
        place-items: center;
        gap: 12px;
        color: var(--dept-muted);
      }
      .department-hero {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        justify-content: space-between;
        align-items: stretch;
        gap: 20px;
        padding: 28px;
        margin-bottom: 18px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background:
          linear-gradient(135deg, rgba(2, 13, 24, 0.96), rgba(4, 22, 39, 0.92)),
          url("data:image/svg+xml,%3Csvg width='900' height='420' viewBox='0 0 900 420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='900' height='420' fill='%23041627'/%3E%3Cg stroke='%236cd3f7' opacity='.16'%3E%3Cpath d='M0 90h900M0 180h900M0 270h900M0 360h900M120 0v420M240 0v420M360 0v420M480 0v420M600 0v420M720 0v420M840 0v420'/%3E%3C/g%3E%3C/svg%3E");
        background-size: cover;
        box-shadow: 0 22px 70px rgba(4, 22, 39, 0.16);
      }
      .department-hero::after {
        content: "";
        position: absolute;
        right: -130px;
        bottom: -170px;
        width: 430px;
        height: 430px;
        background: radial-gradient(circle, rgba(108, 211, 247, 0.24), transparent 62%);
      }
      .department-hero > * {
        position: relative;
        z-index: 1;
      }
      .back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        text-decoration: none;
        font: 800 12px/1 Manrope, sans-serif;
      }
      .back::before {
        content: '<';
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
      }
      h1,
      h2 {
        margin: 0;
        letter-spacing: 0;
      }
      h1 {
        margin-top: 8px;
        color: #ffffff;
        font-size: clamp(30px, 4vw, 44px);
        line-height: 1.04;
      }
      p {
        margin: 6px 0 0;
        color: var(--dept-muted);
      }
      .department-hero p {
        color: #c9d5e4;
      }
      .hero-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(120px, 1fr));
        gap: 10px;
        min-width: min(330px, 100%);
      }
      .hero-stats article {
        display: grid;
        align-content: center;
        gap: 4px;
        min-height: 78px;
        padding: 16px;
        border: 1px solid #e7edf4;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(14px);
      }
      .hero-stats article span {
        color: #9fb0c4;
        font: 800 11px/1.2 Manrope, sans-serif;
        text-transform: uppercase;
      }
      .hero-stats article strong {
        color: #ffffff;
        font: 900 20px/1.1 Manrope, sans-serif;
      }
      .hero-stats span,
      .person-card span,
      .person-card small,
      .table-head,
      .empty-state span {
        color: var(--dept-muted);
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(260px, 340px) 1fr;
        gap: 18px;
        align-items: start;
      }
      .surface {
        background: #fff;
        border: 1px solid var(--dept-border);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      }
      .head-panel {
        display: grid;
        gap: 14px;
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
        align-items: flex-start;
      }
      .section-title p {
        margin-top: 2px;
        font-size: 13px;
      }
      .section-mark {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: var(--dept-primary-soft);
        color: var(--dept-primary);
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0;
        flex: 0 0 auto;
      }
      .section-mark.muted {
        background: #eef2f7;
        color: #64748b;
      }
      .person-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: var(--dept-soft);
        margin-bottom: 14px;
      }
      .head-card {
        align-items: flex-start;
        margin-bottom: 0;
        padding: 14px;
      }
      .head-card div {
        display: grid;
        gap: 3px;
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
        background: var(--dept-primary-soft);
        color: var(--dept-primary);
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
        background: var(--dept-success-soft);
        color: var(--dept-success);
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
      .action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .action-row button {
        min-width: 118px;
      }
      .members-head button,
      .head-panel > button {
        min-height: 40px;
        white-space: nowrap;
      }
      .empty-state {
        display: grid;
        place-items: center;
        gap: 8px;
        padding: 42px 16px;
        color: var(--dept-muted);
        text-align: center;
      }
      .empty-state.compact {
        padding: 22px 12px;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        margin-bottom: 14px;
      }
      @media (max-width: 980px) {
        .layout,
        .department-hero {
          grid-template-columns: 1fr;
          display: grid;
        }
        .hero-stats {
          grid-template-columns: 1fr;
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
  private readonly errors = inject(ErrorHandlerService);
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
  readonly visibleMembers = computed(() => {
    const headIds = this.headIdentitySet();
    return this.members().filter((member) => !this.employeeMatches(member, headIds));
  });

  constructor() {
    void this.load();
  }

  async assignHead(): Promise<void> {
    const dept = this.department();
    if (!dept) return;

    const employees = await firstValueFrom(this.employeeService.getAll()).catch((error) => {
      this.showError(error, 'Employees could not be loaded.');
      return [];
    });
    const selectedUserId = await this.pickEmployee({
      title: 'Assign Department Head',
      label: 'Employee',
      employees,
      emptyText: 'No employees are available to assign as department head.',
    });
    if (!selectedUserId) return;

    const selectedMember = employees.find((m) => (m.appUserId || m.id) === selectedUserId);
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

    const employees = await firstValueFrom(this.employeeService.getAll()).catch((error) => {
      this.showError(error, 'Employees could not be loaded.');
      return [];
    });
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
      this.showError(error, 'Department update failed.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private showError(error: unknown, fallback: string): void {
    const parsed = this.errors.parseHttpError(error as any);
    this.snackBar.open(parsed.generalMessage || fallback, 'Dismiss', { duration: 4000 });
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

  private headIdentitySet(): Set<string> {
    const ids = new Set<string>();
    const deptHeadId = this.department()?.departmentHeadId;
    const head = this.departmentHead();
    if (deptHeadId) ids.add(deptHeadId);
    if (head?.id) ids.add(head.id);
    if (head?.appUserId) ids.add(head.appUserId);
    return ids;
  }

  private employeeMatches(employee: EmployeeListResponse, ids: Set<string>): boolean {
    return ids.has(employee.id) || ids.has(employee.appUserId);
  }
}
