import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse, RoleResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { EmployeeService } from '../../../core/http/employee.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';
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
    MatSelectModule,
    MatStepperModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Employee</h2>
    <mat-dialog-content>
      <mat-stepper linear #stepper>
        <mat-step [stepControl]="step1Form" label="Basic Info">
          <form [formGroup]="step1Form" class="grid">
            <mat-form-field appearance="outline"><mat-label>First name</mat-label><input matInput formControlName="firstName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Last name</mat-label><input matInput formControlName="lastName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Username</mat-label><input matInput formControlName="userName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" formControlName="password"></mat-form-field>
            <div class="strength" [class.medium]="passwordStrength() === 'medium'" [class.strong]="passwordStrength() === 'strong'">{{ passwordStrength() }}</div>
            <mat-form-field appearance="outline"><mat-label>Job title</mat-label><input matInput formControlName="jobTitle"></mat-form-field>
            <mat-form-field appearance="outline" class="wide"><mat-label>Notes</mat-label><textarea matInput rows="3" formControlName="notes"></textarea></mat-form-field>
          </form>
          <div class="actions"><button mat-button matStepperNext>Next</button></div>
        </mat-step>

        <mat-step [stepControl]="step2Form" label="Department & Role">
          <form [formGroup]="step2Form" class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="departmentId">
                @for (dept of departments(); track dept.id) { <mat-option [value]="dept.id">{{ dept.name }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="roleId">
                <mat-option [value]="null">No role</mat-option>
                @for (role of roles(); track role.id) { <mat-option [value]="role.id">{{ role.roleName }}</mat-option> }
              </mat-select>
            </mat-form-field>
          </form>
          <div class="actions"><button mat-button matStepperPrevious>Back</button><button mat-button matStepperNext>Next</button></div>
        </mat-step>

        <mat-step label="Permission Exceptions">
          <p class="note">These override the default permissions of the selected role. Leave empty to use role defaults.</p>
          <div class="permissions">
            <section>
              <strong class="grant">GRANT +</strong>
              @for (group of permissionGroups(); track group) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>{{ group }}</mat-expansion-panel-header>
                  @for (permission of permissionsByGroup(group); track permission.key) {
                    <mat-checkbox [checked]="grantSet().has(permission.key)" (change)="toggleGrant(permission.key, $event.checked)">
                      {{ permission.displayName }} <small>{{ permission.key }}</small>
                    </mat-checkbox>
                  }
                </mat-expansion-panel>
              }
            </section>
            <section>
              <strong class="deny">DENY -</strong>
              @for (group of permissionGroups(); track group) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>{{ group }}</mat-expansion-panel-header>
                  @for (permission of permissionsByGroup(group); track permission.key) {
                    <mat-checkbox [checked]="denySet().has(permission.key)" (change)="toggleDeny(permission.key, $event.checked)">
                      {{ permission.displayName }} <small>{{ permission.key }}</small>
                    </mat-checkbox>
                  }
                </mat-expansion-panel>
              }
            </section>
          </div>
          <div class="summary" [class.warn]="denySet().size">{{ grantSet().size }} granted · {{ denySet().size }} denied</div>
          <div class="actions"><button mat-button matStepperPrevious>Back</button><button mat-raised-button color="primary" (click)="submit()">Create</button></div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
  styles: [`
    mat-dialog-content { width: min(960px, 86vw); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding-top: 12px; }
    .wide { grid-column: 1 / -1; }
    .strength { align-self: center; padding: 8px 10px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-weight: 700; text-transform: capitalize; }
    .strength.medium { background: #fef3c7; color: #92400e; } .strength.strong { background: #dcfce7; color: #166534; }
    .note { padding: 12px; border-radius: 8px; background: #eff6ff; color: #1e40af; }
    .permissions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grant, .deny { display: inline-block; margin-bottom: 10px; padding: 6px 10px; border-radius: 999px; }
    .grant { background: #dcfce7; color: #166534; } .deny { background: #fee2e2; color: #991b1b; }
    mat-checkbox { display: block; margin: 6px 0; } small { display: block; color: #64748b; }
    .summary { margin-top: 14px; padding: 12px; border-radius: 8px; background: #f1f5f9; font-weight: 700; } .summary.warn { background: #fef3c7; color: #92400e; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
    @media (max-width: 760px) { .grid, .permissions { grid-template-columns: 1fr; } }
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
  readonly passwordStrength = computed(() => {
    const value = this.step1Form.controls.password.value;
    const score = Number(value.length >= 8) + Number(/[A-Z]/.test(value)) + Number(/[0-9]/.test(value)) + Number(/[^A-Za-z0-9]/.test(value));
    return score >= 4 ? 'strong' : score >= 2 ? 'medium' : 'weak';
  });

  constructor() {
    void this.loadLookups();
  }

  permissionsByGroup(group: string) {
    return ALL_PERMISSIONS.filter(permission => permission.group === group);
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
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.step2Form.markAllAsTouched();
      return;
    }

    try {
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
      const parsed = this.errors.parse(error);
      this.errors.applyToForm(this.step1Form, parsed.fieldErrors);
      this.errors.applyToForm(this.step2Form, parsed.fieldErrors);
      this.snackBar.open(parsed.generalMessage, 'Dismiss', { duration: 4000 });
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
