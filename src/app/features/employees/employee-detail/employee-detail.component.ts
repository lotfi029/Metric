import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../../core/constants/permissions';
import { EffectivePermissionsResponse, EmployeeResponse, RoleResponse } from '../../../core/models';
import { AuthStore } from '../../../core/auth/auth.store';
import { EmployeeService } from '../../../core/http/employee.service';
import { PermissionService } from '../../../core/http/permission.service';
import { RoleService } from '../../../core/http/role.service';
import { HasPermissionDirective } from '../../../shared/directives';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule, HasPermissionDirective],
  template: `
    @if (employee(); as item) {
      <header class="profile-head">
        <span class="avatar">{{ item.firstName[0] }}{{ item.lastName[0] }}</span>
        <div><h1>{{ item.firstName }} {{ item.lastName }}</h1><p>{{ item.jobTitle }}</p></div>
      </header>
      <mat-tab-group (selectedIndexChange)="onTab($event)">
        <mat-tab label="Profile">
          <section class="panel">
            <div class="info">
              <span>Email <strong>{{ item.email }}</strong></span>
              <span>Username <strong>{{ item.userName }}</strong></span>
              <span>Hire Date <strong>{{ item.hireDate | date }}</strong></span>
              <span>Status <strong>{{ item.isActive ? 'Active' : 'Inactive' }}</strong></span>
              <span>Department <strong>{{ item.departmentName || 'No department' }}</strong></span>
              <span>Created <strong>{{ item.createdAt | date }}</strong></span>
            </div>
            <button mat-button *appHasPermission="PERMISSIONS.employees.update">Edit</button>
            <button mat-button color="warn" *appHasPermission="PERMISSIONS.employees.deactivate">{{ item.isActive ? 'Deactivate' : 'Activate' }}</button>
          </section>
        </mat-tab>
        <mat-tab label="Roles" *appHasPermission="PERMISSIONS.roles.read">
          <section class="panel">
            <mat-chip-set>
              @for (role of roles(); track role.id) {
                <mat-chip>{{ role.roleName }}</mat-chip>
              } @empty {
                <mat-chip>No roles</mat-chip>
              }
            </mat-chip-set>
            <div class="role-actions" *appHasPermission="PERMISSIONS.roles.assignToUser">
              <mat-form-field appearance="outline"><mat-label>Assign role</mat-label><mat-select [formControl]="roleControl">@for (role of allRoles(); track role.id) { <mat-option [value]="role.id">{{ role.roleName }}</mat-option> }</mat-select></mat-form-field>
              <button mat-raised-button color="primary" (click)="assignRole()">Assign Role</button>
            </div>
          </section>
        </mat-tab>
        <mat-tab label="Exceptions" *appHasPermission="PERMISSIONS.permissions.read">
          <section class="panel">
            @if (effective(); as permissions) {
              <mat-expansion-panel expanded>
                <mat-expansion-panel-header>Effective Permissions</mat-expansion-panel-header>
                <mat-chip-set>
                  @for (permission of permissions.permissions; track permission) { <mat-chip>{{ permission }}</mat-chip> }
                </mat-chip-set>
              </mat-expansion-panel>
              <h3>Active Overrides</h3>
              <div class="override-row head"><strong>Permission</strong><strong>Type</strong><strong>Reason</strong><strong>Expires</strong><strong>Actions</strong></div>
              @for (override of permissions.overrides; track override.id) {
                <div class="override-row">
                  <span>{{ override.permission }}</span>
                  <span [class.grant]="override.isGranted" [class.deny]="!override.isGranted">{{ override.isGranted ? 'GRANT' : 'DENY' }}</span>
                  <span>{{ override.reason || '-' }}</span>
                  <span>{{ override.expiresAt ? (override.expiresAt | date) : 'Never' }}</span>
                  <button mat-button color="warn" *appHasPermission="PERMISSIONS.permissions.revoke" (click)="revoke(override.permission)">Revoke</button>
                </div>
              }
            }
            <mat-expansion-panel *appHasPermission="PERMISSIONS.permissions.grant">
              <mat-expansion-panel-header>Add Override</mat-expansion-panel-header>
              <form [formGroup]="overrideForm" class="override-form">
                <mat-form-field appearance="outline"><mat-label>Permission</mat-label><mat-select formControlName="permission">@for (permission of allPermissions; track permission.key) { <mat-option [value]="permission.key">{{ permission.group }} - {{ permission.displayName }}</mat-option> }</mat-select></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Reason</mat-label><input matInput formControlName="reason"></mat-form-field>
                <button mat-raised-button color="primary" type="button" (click)="grant()">Grant</button>
                <button mat-raised-button color="warn" type="button" (click)="deny()">Deny</button>
              </form>
            </mat-expansion-panel>
          </section>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    .profile-head { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
    .avatar { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 999px; background: #0f172a; color: #fff; font-weight: 800; }
    h1 { margin: 0; } p { margin: 4px 0 0; color: #64748b; }
    .panel { padding: 18px 0; display: grid; gap: 16px; }
    .info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .info span, .override-row { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
    .info strong { display: block; margin-top: 4px; color: #0f172a; }
    .role-actions, .override-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .override-row { display: grid; grid-template-columns: 1.6fr .7fr 1fr .8fr .7fr; gap: 10px; align-items: center; margin-bottom: 8px; }
    .head { background: #f8fafc; } .grant { color: #15803d; font-weight: 800; } .deny { color: #b91c1c; font-weight: 800; }
    @media (max-width: 820px) { .info, .override-row { grid-template-columns: 1fr; } }
  `],
})
export class EmployeeDetailComponent {
  readonly PERMISSIONS = PERMISSIONS;
  readonly allPermissions = ALL_PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly permissionService = inject(PermissionService);
  private readonly roleService = inject(RoleService);
  private readonly authStore = inject(AuthStore);

  readonly employee = signal<EmployeeResponse | null>(null);
  readonly effective = signal<EffectivePermissionsResponse | null>(null);
  readonly roles = signal<RoleResponse[]>([]);
  readonly allRoles = signal<RoleResponse[]>([]);
  readonly roleControl = this.fb.control<string | null>(null);
  readonly overrideForm = this.fb.nonNullable.group({
    permission: ['', Validators.required],
    reason: ['', Validators.maxLength(500)],
  });

  constructor() {
    void this.load();
  }

  onTab(index: number): void {
    if (index === 2) void this.loadEffective();
  }

  async grant(): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId || this.overrideForm.invalid) return;
    await firstValueFrom(this.permissionService.grant({ targetUserId, permission: this.overrideForm.controls.permission.value, reason: this.overrideForm.controls.reason.value }));
    await this.afterOverride(targetUserId);
  }

  async deny(): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId || this.overrideForm.invalid) return;
    await firstValueFrom(this.permissionService.deny({ targetUserId, permission: this.overrideForm.controls.permission.value, reason: this.overrideForm.controls.reason.value }));
    await this.afterOverride(targetUserId);
  }

  async revoke(permission: string): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId) return;
    await firstValueFrom(this.permissionService.revoke({ targetUserId, permission }));
    await this.afterOverride(targetUserId);
  }

  async assignRole(): Promise<void> {
    const userId = this.employee()?.appUserId;
    const roleId = this.roleControl.value;
    if (!userId || !roleId) return;
    await firstValueFrom(this.roleService.assignToUser(userId, roleId));
    if (userId === this.authStore.user()?.userId) await this.authStore.refreshPermissions();
    await this.loadRoles(userId);
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const employee = await firstValueFrom(this.employeeService.getById(id));
    this.employee.set(employee);
    await Promise.all([this.loadRoles(employee.appUserId), this.loadAllRoles()]);
  }

  private async loadRoles(userId: string): Promise<void> {
    this.roles.set(await firstValueFrom(this.roleService.getUserRoles(userId)).catch(() => []));
  }

  private async loadAllRoles(): Promise<void> {
    this.allRoles.set(await firstValueFrom(this.roleService.getAll()).catch(() => []));
  }

  private async loadEffective(): Promise<void> {
    const userId = this.employee()?.appUserId;
    if (userId) this.effective.set(await firstValueFrom(this.permissionService.getUserEffective(userId)));
  }

  private async afterOverride(targetUserId: string): Promise<void> {
    await this.loadEffective();
    if (targetUserId === this.authStore.user()?.userId) await this.authStore.refreshPermissions();
  }
}
