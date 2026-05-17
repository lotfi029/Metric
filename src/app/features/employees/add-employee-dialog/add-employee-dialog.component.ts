import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse, RoleResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { EmployeeService } from '../../../core/http/employee.service';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { ErrorHandlerService, FormError } from '../../../core/http/error-handler.service';
import { RoleService } from '../../../core/http/role.service';

@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatStepperModule,
    ErrorDisplayComponent,
  ],
  template: `
    <header class="dialog-hero">
      <div class="hero-mark">EM</div>
      <div>
        <p class="eyebrow">New team member</p>
        <h2 mat-dialog-title>Add Employee</h2>
        <p class="hero-copy">Create the profile, assignment, and permission exceptions.</p>
      </div>
    </header>

    <mat-dialog-content class="employee-dialog">
      <app-error-display [error]="formError()" (dismissed)="formError.set(null)" />

      <mat-stepper linear #stepper class="employee-stepper">
        <mat-step [stepControl]="step1Form" label="Basic Info">
          <form [formGroup]="step1Form" class="form-panel">
            <div class="section-head">
              <span class="section-mark">01</span>
              <div>
                <h3>Profile details</h3>
                <p>Use the employee's real name and work contact information.</p>
              </div>
            </div>

            <div class="grid">
              <mat-form-field appearance="outline">
                <mat-label>First name</mat-label>
                <input matInput formControlName="firstName" autocomplete="given-name">
                <mat-error>{{ controlError('firstName') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last name</mat-label>
                <input matInput formControlName="lastName" autocomplete="family-name">
                <mat-error>{{ controlError('lastName') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="email">
                <mat-error>{{ controlError('email') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="userName" autocomplete="username">
                <mat-error>{{ controlError('userName') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" autocomplete="new-password">
                <mat-hint>At least 8 characters.</mat-hint>
                <mat-error>{{ controlError('password') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Job title</mat-label>
                <input matInput formControlName="jobTitle">
                <mat-error>{{ controlError('jobTitle') }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="wide">
                <mat-label>Notes</mat-label>
                <textarea matInput rows="2" formControlName="notes"></textarea>
                <mat-hint align="end">{{ step1Form.controls.notes.value.length }}/2000</mat-hint>
                <mat-error>{{ controlError('notes') }}</mat-error>
              </mat-form-field>
            </div>
          </form>

          <div class="actions">
            <button mat-raised-button color="primary" matStepperNext>
              Next
            </button>
          </div>
        </mat-step>

        <mat-step [stepControl]="step2Form" label="Department & Role">
          <form [formGroup]="step2Form" class="form-panel">
            <div class="section-head">
              <span class="section-mark">02</span>
              <div>
                <h3>Assignment</h3>
                <p>Choose where this employee belongs and which role should seed their permissions.</p>
              </div>
            </div>

            <div class="assignment-grid">
              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="departmentId">
                  @for (dept of departments(); track dept.id) {
                    <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                  }
                </mat-select>
                <mat-error>{{ departmentError() }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select formControlName="roleId">
                  <mat-option [value]="null">No role</mat-option>
                  @for (role of roles(); track role.id) {
                    <mat-option [value]="role.id">{{ role.roleName }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Defaults to Employee when available.</mat-hint>
              </mat-form-field>
            </div>
          </form>

          <div class="actions">
            <button mat-button matStepperPrevious>
              Back
            </button>
            <button mat-raised-button color="primary" matStepperNext>
              Next
            </button>
          </div>
        </mat-step>

        <mat-step label="Permission Exceptions">
          <div class="permissions-head">
            <div>
              <h3>Permission exceptions</h3>
              <p>These override the default permissions of the selected role. Leave both columns empty to use role defaults.</p>
            </div>
            <div class="summary" [class.warn]="denySet().size">
              <span>{{ grantSet().size }} granted</span>
              <span>{{ denySet().size }} denied</span>
            </div>
          </div>

          <div class="permissions">
            <section>
              <div class="permission-title grant">
                <strong>Grant</strong>
              </div>
              @for (group of permissionGroups(); track group) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{ group }}</mat-panel-title>
                    <mat-panel-description>{{ selectedInGroup(group, 'grant') }}</mat-panel-description>
                  </mat-expansion-panel-header>
                  @for (permission of permissionsByGroup(group); track permission.key) {
                    <mat-checkbox [checked]="grantSet().has(permission.key)" (change)="toggleGrant(permission.key, $event.checked)">
                      {{ permission.displayName }} <small>{{ permission.key }}</small>
                    </mat-checkbox>
                  }
                </mat-expansion-panel>
              }
            </section>

            <section>
              <div class="permission-title deny">
                <strong>Deny</strong>
              </div>
              @for (group of permissionGroups(); track group) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{ group }}</mat-panel-title>
                    <mat-panel-description>{{ selectedInGroup(group, 'deny') }}</mat-panel-description>
                  </mat-expansion-panel-header>
                  @for (permission of permissionsByGroup(group); track permission.key) {
                    <mat-checkbox [checked]="denySet().has(permission.key)" (change)="toggleDeny(permission.key, $event.checked)">
                      {{ permission.displayName }} <small>{{ permission.key }}</small>
                    </mat-checkbox>
                  }
                </mat-expansion-panel>
              }
            </section>
          </div>

          <div class="actions">
            <button mat-button matStepperPrevious [disabled]="isSaving()">
              Back
            </button>
            <button mat-raised-button color="primary" [disabled]="isSaving()" (click)="submit()">
              <mat-spinner diameter="18" [class.is-hidden]="!isSaving()"></mat-spinner>
              <span>{{ isSaving() ? 'Creating...' : 'Create employee' }}</span>
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
  styles: [`
    :host { display: block; color: var(--color-text); overflow-x: hidden; }
    .dialog-hero {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--color-border);
      background: #fff;
    }
    .hero-mark {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--color-navy-800);
      color: #fff;
      font-size: 12px;
      font-weight: 900;
    }
    .eyebrow { margin: 0 0 4px; color: var(--color-text-muted); font-size: 12px; font-weight: 700; }
    h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
      color: var(--color-navy-800);
      font: 800 21px/1.2 Manrope, sans-serif;
    }
    .hero-copy { margin: 4px 0 0; color: var(--color-text-muted); }
    .employee-dialog {
      width: 100%;
      max-width: 100%;
      padding: 14px 20px 18px;
      overflow-x: hidden;
    }
    .employee-stepper { background: transparent; }
    :host ::ng-deep .employee-stepper .mat-horizontal-content-container { padding: 0; }
    :host ::ng-deep .employee-stepper .mat-horizontal-stepper-header-container { margin-bottom: 6px; }
    :host ::ng-deep .employee-stepper .mat-horizontal-stepper-header { height: 46px; padding: 0 12px; }
    .form-panel {
      margin-top: 10px;
      padding: 14px;
      border-radius: 8px;
      background: var(--color-surface);
    }
    .section-head {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }
    .section-mark {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--color-cyan-100);
      color: #006e8c;
      font-size: 12px;
      font-weight: 900;
    }
    h3 { margin: 0; color: var(--color-navy-800); font: 800 16px/1.25 Manrope, sans-serif; }
    .section-head p, .permissions-head p { margin: 2px 0 0; color: var(--color-text-muted); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 14px 16px; }
    .assignment-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .wide { grid-column: 1 / -1; }
    mat-form-field { width: 100%; }
    :host ::ng-deep .mat-mdc-form-field input.mat-mdc-input-element,
    :host ::ng-deep .mat-mdc-form-field textarea.mat-mdc-input-element {
      color: #041627;
      font: 500 16px/1.45 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif;
      letter-spacing: 0;
    }
    :host ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label,
    :host ::ng-deep .mat-mdc-select-value {
      color: #344054;
      font-weight: 800;
      letter-spacing: 0;
    }
    .permissions-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin: 10px 0 12px;
      padding: 14px;
      border-radius: 8px;
      background: var(--color-surface);
    }
    .permissions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
    .permissions section {
      min-width: 0;
      padding: 12px;
      border-radius: 8px;
      background: #fff;
    }
    .permission-title {
      display: inline-flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 7px 10px;
      border-radius: 8px;
      font-weight: 800;
    }
    .grant { background: var(--color-success-bg); color: var(--color-success); }
    .deny { background: var(--color-error-bg); color: var(--color-error); }
    mat-expansion-panel { border-radius: 8px; box-shadow: none !important; }
    mat-expansion-panel + mat-expansion-panel { margin-top: 8px; }
    mat-panel-description { flex-grow: 0; color: var(--color-text-subtle); }
    mat-checkbox { display: block; margin: 6px 0; }
    small { display: block; color: var(--color-text-subtle); font-size: 11px; }
    .summary {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
      min-width: 190px;
      color: var(--color-text-muted);
      font-weight: 800;
    }
    .summary span {
      padding: 7px 10px;
      border-radius: 999px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
    }
    .summary.warn span:last-child { background: var(--color-warning-bg); border-color: #f8d27a; color: var(--color-warning); }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
    .actions button { min-height: 40px; }
    .actions mat-spinner { margin-right: 8px; }
    .is-hidden { display: none !important; }
    @media (max-width: 760px) {
      .dialog-hero { grid-template-columns: 1fr; padding: 20px; }
      .employee-dialog { padding: 14px 16px 18px; }
      .grid, .assignment-grid, .permissions { grid-template-columns: minmax(0, 1fr); }
      .wide { grid-column: auto; }
      .permissions-head { display: grid; }
      .summary { justify-content: flex-start; min-width: 0; }
    }
  `],
})
export class AddEmployeeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly roleService = inject(RoleService);
  private readonly dialogRef = inject(MatDialogRef<AddEmployeeDialogComponent>);
  private readonly errors = inject(ErrorHandlerService);
  private readonly snackBar = inject(MatSnackBar);

  readonly departments = signal<DepartmentResponse[]>([]);
  readonly roles = signal<RoleResponse[]>([]);
  readonly grantSet = signal<Set<string>>(new Set());
  readonly denySet = signal<Set<string>>(new Set());
  readonly formError = signal<FormError | null>(null);
  readonly isSaving = signal(false);
  readonly permissionGroups = computed(() => [...new Set(ALL_PERMISSIONS.map(permission => permission.group))]);

  readonly step1Form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    userName: ['', [Validators.required, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    jobTitle: ['', [Validators.required, Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(2000)]],
  });
  readonly step2Form = this.fb.group({
    departmentId: ['', Validators.required],
    roleId: [null as string | null],
  });
  constructor() {
    void this.loadLookups();
  }

  permissionsByGroup(group: string) {
    return ALL_PERMISSIONS.filter(permission => permission.group === group);
  }

  selectedInGroup(group: string, type: 'grant' | 'deny'): string {
    const selected = type === 'grant' ? this.grantSet() : this.denySet();
    const count = this.permissionsByGroup(group).filter(permission => selected.has(permission.key)).length;
    return count ? `${count} selected` : 'None';
  }

  controlError(controlName: keyof typeof this.step1Form.controls): string {
    const control = this.step1Form.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength')) return `Use at least ${control.getError('minlength').requiredLength} characters.`;
    if (control.hasError('maxlength')) return `Use ${control.getError('maxlength').requiredLength} characters or fewer.`;
    return 'Check this value.';
  }

  departmentError(): string {
    const control = this.step2Form.controls.departmentId;
    if ((!control.touched && !control.dirty) || !control.hasError('required')) return '';
    return 'Choose a department.';
  }

  toggleGrant(permission: string, checked: boolean): void {
    this.grantSet.update(set => this.updatedSet(set, permission, checked));
    if (checked) this.denySet.update(set => this.updatedSet(set, permission, false));
  }

  toggleDeny(permission: string, checked: boolean): void {
    this.denySet.update(set => this.updatedSet(set, permission, checked));
    if (checked) this.grantSet.update(set => this.updatedSet(set, permission, false));
  }

  async submit(): Promise<void> {
    if (this.isSaving()) return;

    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.step2Form.markAllAsTouched();
      return;
    }

    try {
      this.isSaving.set(true);
      this.formError.set(null);
      const result = await firstValueFrom(this.employeeService.create({
        ...this.step1Form.getRawValue(),
        notes: this.step1Form.controls.notes.value || null,
        roleId: this.step2Form.value.roleId ?? null,
        departmentId: this.step2Form.value.departmentId ?? null,
        grantPermissions: [...this.grantSet()],
        denyPermissions: [...this.denySet()],
      }));
      this.dialogRef.close({ success: true, employeeId: result });
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.formError.set(parsed);
      this.errors.applyToForm(this.step1Form, parsed.fieldErrors);
      this.errors.applyToForm(this.step2Form, parsed.fieldErrors);
      this.snackBar.open(parsed.generalMessage, 'Dismiss', { duration: 4000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadLookups(): Promise<void> {
    const [departments, roles] = await Promise.all([
      firstValueFrom(this.departmentService.getAll()).catch(() => []),
      firstValueFrom(this.roleService.getAll()).catch(() => []),
    ]);
    this.departments.set(departments);
    this.roles.set(roles);
    this.step2Form.patchValue({ roleId: roles.find(role => role.roleName.toLowerCase() === 'employee')?.id ?? null });
  }

  private updatedSet(set: Set<string>, permission: string, checked: boolean): Set<string> {
    const next = new Set(set);
    checked ? next.add(permission) : next.delete(permission);
    return next;
  }
}
