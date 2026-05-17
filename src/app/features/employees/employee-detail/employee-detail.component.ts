import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../../core/constants/permissions';
import { EffectivePermissionsResponse, EmployeeResponse, RoleResponse } from '../../../core/models';
import { AuthStore } from '../../../core/auth/auth.store';
import { EmployeeService } from '../../../core/http/employee.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';
import { PermissionService } from '../../../core/http/permission.service';
import { RoleService } from '../../../core/http/role.service';
import { HasPermissionDirective } from '../../../shared/directives';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatTabsModule,
    HasPermissionDirective,
  ],
  template: `
    @if (employee(); as item) {
      <header class="profile-hero">
        <div class="hero-main">
          <span class="avatar large">{{ initials(item) }}</span>
          <div class="hero-copy">
            <span class="hero-kicker">Employee profile</span>
            <h1>{{ displayName(item) }}</h1>
            <p>{{ item.jobTitle || 'No title assigned' }}</p>
          </div>
        </div>
        <div class="hero-actions">
          <a class="back" href="/employees">Back to employees</a>
          <span class="status-badge" [class.inactive]="!item.isActive">{{ item.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
        <div class="hero-stats">
          <article><span>Status</span><strong>{{ item.isActive ? 'Active' : 'Inactive' }}</strong></article>
          <article><span>Roles</span><strong>{{ roles().length }}</strong></article>
          <article><span>Exceptions</span><strong>{{ effective()?.overrides?.length ?? 0 }}</strong></article>
        </div>
      </header>

      <mat-tab-group class="detail-tabs" (selectedIndexChange)="onTab($event)">
        <mat-tab label="Profile">
          <section class="panel profile-grid">
            <div class="info-card wide">
              <span>Employee</span>
              <strong>{{ displayName(item) }}</strong>
              <small>{{ item.email || 'No email' }}</small>
            </div>
            <div class="info-card"><span>Username</span><strong>{{ item.userName || 'Not set' }}</strong></div>
            <div class="info-card"><span>Department</span><strong>{{ item.departmentName || 'No department' }}</strong></div>
            <div class="info-card"><span>Hire Date</span><strong>{{ item.hireDate ? (item.hireDate | date) : 'Not set' }}</strong></div>
            <div class="info-card"><span>Created</span><strong>{{ item.createdAt ? (item.createdAt | date) : 'Not set' }}</strong></div>
            <div class="info-card"><span>Last Login</span><strong>{{ item.lastLoginAt ? (item.lastLoginAt | date) : 'No login yet' }}</strong></div>
            <div class="info-card wide"><span>Notes</span><strong>{{ item.notes || 'No notes' }}</strong></div>
            <div class="panel-actions">
              <button mat-stroked-button *appHasPermission="PERMISSIONS.employees.update">Edit profile</button>
              <button mat-stroked-button color="warn" *appHasPermission="PERMISSIONS.employees.deactivate">{{ item.isActive ? 'Deactivate' : 'Activate' }}</button>
            </div>
          </section>
        </mat-tab>

        <mat-tab label="Roles" *appHasPermission="PERMISSIONS.roles.read">
          <section class="panel">
            <header class="panel-head">
              <div>
                <h2>Role Assignment</h2>
                <p>Review active roles and assign another role without leaving the profile.</p>
              </div>
            </header>

            <div class="role-board">
              <section class="role-column">
                <h3>Assigned roles</h3>
                @for (role of roles(); track role.id) {
                  <article class="role-card active">
                    <div>
                      <strong>{{ role.roleName }}</strong>
                      <span>{{ isSystem(role) ? 'System role' : 'Custom role' }}</span>
                    </div>
                    <button mat-button color="warn" *appHasPermission="PERMISSIONS.roles.assignToUser" (click)="removeRole(role)">Remove</button>
                  </article>
                } @empty {
                  <div class="empty-state compact"><strong>No assigned roles</strong><span>Assign a role to seed permissions.</span></div>
                }
              </section>

              <section class="role-column">
                <h3>Available roles</h3>
                @for (role of availableRoles(); track role.id) {
                  <article class="role-card">
                    <div>
                      <strong>{{ role.roleName }}</strong>
                      <span>{{ isSystem(role) ? 'System role' : 'Custom role' }}</span>
                    </div>
                    <button mat-stroked-button *appHasPermission="PERMISSIONS.roles.assignToUser" (click)="assignRoleById(role.id)">Assign</button>
                  </article>
                } @empty {
                  <div class="empty-state compact"><strong>All roles assigned</strong><span>This employee already has every available role.</span></div>
                }
              </section>
            </div>
          </section>
        </mat-tab>

        <mat-tab label="Exceptions" *appHasPermission="PERMISSIONS.permissions.read">
          <section class="panel">
            @if (effective(); as permissions) {
              <header class="panel-head">
                <div>
                  <h2>Permission Exceptions</h2>
                  <p>Exceptions override role defaults for this employee.</p>
                </div>
                <div class="summary">
                  <span>{{ permissions.permissions.length }} effective</span>
                  <span>{{ permissions.overrides.length }} exceptions</span>
                </div>
              </header>

              <div class="exception-layout">
                <section class="override-list">
                  <h3>Active exceptions</h3>
                  @for (override of permissions.overrides; track override.id) {
                    <article class="override-card">
                      <div class="override-main">
                        <strong>{{ override.permission }}</strong>
                        <span>{{ override.reason || 'No reason provided' }}</span>
                      </div>
                      <div class="override-meta">
                        <span class="pill" [class.grant]="override.isGranted" [class.deny]="!override.isGranted">{{ override.isGranted ? 'Grant' : 'Deny' }}</span>
                        <small>{{ override.expiresAt ? (override.expiresAt | date) : 'Never expires' }}</small>
                      </div>
                      <button mat-stroked-button color="warn" *appHasPermission="PERMISSIONS.permissions.revoke" (click)="revoke(override.permission)">Revoke</button>
                    </article>
                  } @empty {
                    <div class="empty-state"><strong>No active exceptions</strong><span>This employee currently follows role permissions.</span></div>
                  }
                </section>

                <section class="override-create" *appHasPermission="PERMISSIONS.permissions.grant">
                  <h3>Add exception</h3>
                  <form [formGroup]="overrideForm" class="override-form">
                    <label class="field">
                      <span>Permission</span>
                      <select formControlName="permission" [class.invalid]="overrideForm.controls.permission.invalid && overrideForm.controls.permission.touched">
                        <option value="" disabled>Select permission</option>
                        @for (group of permissionGroups(); track group) {
                          <optgroup [label]="group">
                            @for (permission of permissionsByGroup(group); track permission.key) {
                              <option [value]="permission.key">{{ permission.displayName }}</option>
                            }
                          </optgroup>
                        }
                      </select>
                      @if (overrideForm.controls.permission.invalid && overrideForm.controls.permission.touched) {
                        <small>Please select a permission.</small>
                      }
                    </label>

                    <label class="field">
                      <span>Reason</span>
                      <input formControlName="reason" placeholder="Optional note">
                    </label>
                    <div class="inline-actions">
                      <button mat-raised-button color="primary" type="button" (click)="grant()">Grant</button>
                      <button mat-raised-button color="warn" type="button" (click)="deny()">Deny</button>
                    </div>
                  </form>
                </section>
              </div>

              <mat-expansion-panel class="effective-panel">
                <mat-expansion-panel-header>Effective permissions by group</mat-expansion-panel-header>
                @for (group of permissionGroups(); track group) {
                  <section class="permission-group">
                    <h4>{{ group }}</h4>
                    <div class="permission-chips">
                      @for (permission of effectiveByGroup(group); track permission) {
                        <span>{{ permission }}</span>
                      } @empty {
                        <small>No active permissions in this group.</small>
                      }
                    </div>
                  </section>
                }
              </mat-expansion-panel>
            } @else {
              <div class="empty-state"><strong>Permissions are loading</strong><span>Open this tab again if the data does not appear.</span></div>
            }
          </section>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    :host {
      display: block;
      color: #172033;
    }

    .profile-hero {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 22px;
      align-items: start;
      padding: clamp(22px, 4vw, 34px);
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, .14);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(2, 13, 24, .96), rgba(4, 22, 39, .92)),
        url("data:image/svg+xml,%3Csvg width='900' height='420' viewBox='0 0 900 420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='900' height='420' fill='%23041627'/%3E%3Cg stroke='%236cd3f7' opacity='.16'%3E%3Cpath d='M0 90h900M0 180h900M0 270h900M0 360h900M120 0v420M240 0v420M360 0v420M480 0v420M600 0v420M720 0v420M840 0v420'/%3E%3C/g%3E%3C/svg%3E");
      background-size: cover;
      box-shadow: 0 22px 70px rgba(4, 22, 39, .16);
    }

    .profile-hero::after {
      content: "";
      position: absolute;
      right: -130px;
      bottom: -170px;
      width: 430px;
      height: 430px;
      background: radial-gradient(circle, rgba(108, 211, 247, .24), transparent 62%);
    }

    .hero-main,
    .hero-actions,
    .hero-stats {
      position: relative;
      z-index: 1;
    }

    .hero-main {
      display: grid;
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 18px;
      align-items: center;
    }

    .avatar {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: #e8f1ff;
      color: #2563eb;
      font-weight: 900;
    }

    .avatar.large {
      width: 72px;
      height: 72px;
      border: 1px solid rgba(255, 255, 255, .2);
      background: rgba(255, 255, 255, .1);
      color: #6cd3f7;
      font: 900 22px/1 Manrope, sans-serif;
      backdrop-filter: blur(16px);
    }

    .hero-copy {
      min-width: 0;
    }

    .hero-kicker {
      display: block;
      margin-bottom: 7px;
      color: #6cd3f7;
      font: 800 12px/1.2 Manrope, sans-serif;
      text-transform: uppercase;
    }

    .back {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      padding: 0 12px;
      border: 1px solid rgba(255, 255, 255, .14);
      border-radius: 8px;
      background: rgba(255, 255, 255, .08);
      color: #ffffff;
      text-decoration: none;
      font: 800 12px/1 Manrope, sans-serif;
    }

    .hero-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }

    .status-badge {
      display: inline-grid;
      place-items: center;
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(120, 216, 168, .16);
      color: #bff1d4;
      font: 900 12px/1 Manrope, sans-serif;
    }

    .status-badge.inactive {
      background: rgba(255, 218, 214, .16);
      color: #ffdad6;
    }

    h1,
    h2,
    h3,
    h4 {
      margin: 0;
      letter-spacing: 0;
    }

    h1 {
      color: #ffffff;
      font: 900 clamp(30px, 4vw, 44px)/1.04 Manrope, sans-serif;
      overflow-wrap: anywhere;
    }

    h2 {
      color: #041627;
      font: 900 24px/1.15 Manrope, sans-serif;
    }

    h3 {
      color: #041627;
      font: 900 17px/1.2 Manrope, sans-serif;
    }

    h4 {
      color: #344054;
      font: 900 14px/1.2 Manrope, sans-serif;
    }

    .profile-hero p {
      margin: 8px 0 0;
      color: #c9d5e4;
      font-size: 15px;
    }

    p,
    small,
    .info-card span,
    .role-card span,
    .override-card span {
      color: #64748b;
    }

    .hero-stats {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 4px;
    }

    .hero-stats article {
      display: grid;
      gap: 5px;
      padding: 15px;
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 8px;
      background: rgba(255, 255, 255, .08);
      backdrop-filter: blur(14px);
    }

    .hero-stats span {
      color: #9fb0c4;
      font: 800 11px/1.2 Manrope, sans-serif;
      text-transform: uppercase;
    }

    .hero-stats strong {
      color: #ffffff;
      font: 900 22px/1.1 Manrope, sans-serif;
    }

    :host ::ng-deep .detail-tabs .mat-mdc-tab-body-content {
      overflow: visible;
    }

    :host ::ng-deep .detail-tabs .mat-mdc-tab-labels {
      gap: 6px;
    }

    :host ::ng-deep .detail-tabs .mdc-tab {
      border-radius: 8px 8px 0 0;
      letter-spacing: 0;
    }

    .panel {
      padding: 20px 0;
      display: grid;
      gap: 16px;
    }

    .profile-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .info-card {
      display: grid;
      gap: 6px;
      min-height: 104px;
      padding: 16px;
      border: 1px solid #e1e7ef;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(4, 22, 39, .05);
    }

    .info-card span {
      font: 800 11px/1.2 Manrope, sans-serif;
      text-transform: uppercase;
    }

    .info-card strong {
      color: #172033;
      font: 800 16px/1.35 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif;
      overflow-wrap: anywhere;
    }

    .wide,
    .panel-actions {
      grid-column: 1 / -1;
    }

    .panel-actions,
    .inline-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding: 18px;
      border: 1px solid #e1e7ef;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(4, 22, 39, .05);
    }

    .panel-head p {
      margin: 6px 0 0;
    }

    .role-board,
    .exception-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      align-items: start;
    }

    .role-column,
    .override-list,
    .override-create {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid #e1e7ef;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(4, 22, 39, .05);
    }

    .role-card,
    .override-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 14px;
      border: 1px solid #e8eef5;
      border-radius: 8px;
      background: #f8fafc;
    }

    .role-card > div {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .role-card strong,
    .override-card strong {
      color: #172033;
      font: 900 15px/1.25 Manrope, sans-serif;
      overflow-wrap: anywhere;
    }

    .role-card span {
      display: block;
    }

    .role-card.active {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .override-card {
      grid-template-columns: minmax(0, 1fr);
      align-items: stretch;
    }

    .override-main {
      display: grid;
      gap: 6px;
      min-width: 0;
    }

    .override-main span {
      overflow-wrap: anywhere;
    }

    .override-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .override-card button {
      justify-self: start;
    }

    .pill {
      width: fit-content;
      padding: 5px 10px;
      border-radius: 999px;
      font: 900 12px/1 Manrope, sans-serif;
    }

    .grant {
      background: #dcfce7;
      color: #166534;
    }

    .deny {
      background: #fee2e2;
      color: #991b1b;
    }

    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .summary span,
    .permission-chips span {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      background: #f8fafc;
      color: #475569;
      font: 800 12px/1 Manrope, sans-serif;
    }

    .override-form {
      display: grid;
      gap: 14px;
    }

    .field {
      display: grid;
      gap: 8px;
      color: #041627;
    }

    .field span {
      color: #344054;
      font-size: 13px;
      font-weight: 800;
    }

    .field input,
    .field select {
      width: 100%;
      height: 50px;
      border: 1px solid #d7dee8;
      border-radius: 8px;
      background: #ffffff;
      color: #041627;
      font: 600 15px/1.2 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif;
      outline: none;
      padding: 0 14px;
      transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
    }

    .field select {
      appearance: auto;
      cursor: pointer;
    }

    .field input::placeholder {
      color: #9aa4b2;
      font-weight: 500;
    }

    .field input:focus,
    .field select:focus {
      border-color: #0073e6;
      box-shadow: 0 0 0 3px rgba(0, 115, 230, .12);
    }

    .field input.invalid,
    .field select.invalid {
      border-color: #ba1a1a;
    }

    .field small {
      color: #ba1a1a;
      font-size: 12px;
      font-weight: 700;
    }

    .effective-panel {
      border: 1px solid #e1e7ef;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(4, 22, 39, .05) !important;
    }

    .permission-group {
      padding: 12px 0;
      border-top: 1px solid #eef2f7;
    }

    .permission-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .empty-state {
      display: grid;
      place-items: center;
      gap: 6px;
      min-height: 140px;
      padding: 24px;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      color: #64748b;
      text-align: center;
      background: #fbfdff;
    }

    .empty-state strong {
      color: #172033;
    }

    .empty-state.compact {
      min-height: 96px;
    }

    @media (max-width: 1050px) {
      .profile-hero,
      .hero-stats,
      .profile-grid,
      .role-board,
      .exception-layout {
        grid-template-columns: 1fr;
      }

      .hero-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 760px) {
      .hero-main,
      .role-card,
      .override-card,
      .panel-head {
        grid-template-columns: 1fr;
        display: grid;
      }

      .summary {
        justify-content: flex-start;
      }
    }
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
  private readonly errors = inject(ErrorHandlerService);
  private readonly snackBar = inject(MatSnackBar);

  readonly employee = signal<EmployeeResponse | null>(null);
  readonly effective = signal<EffectivePermissionsResponse | null>(null);
  readonly roles = signal<RoleResponse[]>([]);
  readonly allRoles = signal<RoleResponse[]>([]);
  readonly availableRoles = computed(() => {
    const assigned = new Set(this.roles().map((role) => role.id));
    return this.allRoles().filter((role) => !assigned.has(role.id));
  });
  readonly permissionGroups = computed(() => [
    ...new Set(ALL_PERMISSIONS.map((permission) => permission.group)),
  ]);
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

  initials(employee: EmployeeResponse): string {
    return `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase() || 'E';
  }

  displayName(employee: EmployeeResponse): string {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.userName || employee.email || 'Unnamed employee';
  }

  permissionsByGroup(group: string) {
    return ALL_PERMISSIONS.filter((permission) => permission.group === group);
  }

  effectiveByGroup(group: string): string[] {
    const known = new Set(this.permissionsByGroup(group).map((permission) => permission.key));
    return this.effective()?.permissions.filter((permission) => known.has(permission)) ?? [];
  }

  isSystem(role: RoleResponse): boolean {
    return ['admin', 'manager', 'departmenthead', 'employee', 'client'].includes(role.roleName.toLowerCase());
  }

  async grant(): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId || this.overrideForm.invalid) {
      this.overrideForm.markAllAsTouched();
      return;
    }
    await this.run(
      () => this.permissionService.grant({ targetUserId, permission: this.overrideForm.controls.permission.value, reason: this.overrideForm.controls.reason.value }),
      'Permission granted.',
    );
    await this.afterOverride(targetUserId);
  }

  async deny(): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId || this.overrideForm.invalid) {
      this.overrideForm.markAllAsTouched();
      return;
    }
    await this.run(
      () => this.permissionService.deny({ targetUserId, permission: this.overrideForm.controls.permission.value, reason: this.overrideForm.controls.reason.value }),
      'Permission denied.',
    );
    await this.afterOverride(targetUserId);
  }

  async revoke(permission: string): Promise<void> {
    const targetUserId = this.employee()?.appUserId;
    if (!targetUserId) return;
    await this.run(() => this.permissionService.revoke({ targetUserId, permission }), 'Exception revoked.');
    await this.afterOverride(targetUserId);
  }

  async assignRole(): Promise<void> {
    const roleId = this.roleControl.value;
    if (roleId) await this.assignRoleById(roleId);
  }

  async assignRoleById(roleId: string): Promise<void> {
    const userId = this.employee()?.appUserId;
    if (!userId) return;
    await this.run(() => this.roleService.assignToUser(userId, roleId), 'Role assigned.');
    if (userId === this.authStore.user()?.userId) await this.authStore.refreshPermissions();
    await this.loadRoles(userId);
  }

  async removeRole(role: RoleResponse): Promise<void> {
    const userId = this.employee()?.appUserId;
    if (!userId) return;
    await this.run(() => this.roleService.removeFromUser(userId, role.id), 'Role removed.');
    if (userId === this.authStore.user()?.userId) await this.authStore.refreshPermissions();
    await this.loadRoles(userId);
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const employee = await firstValueFrom(this.employeeService.getById(id));
    this.employee.set(employee);
    await Promise.all([this.loadRoles(employee.appUserId), this.loadAllRoles(), this.loadEffective()]);
  }

  private async loadRoles(userId: string): Promise<void> {
    this.roles.set(await firstValueFrom(this.roleService.getUserRoles(userId)).catch(() => []));
  }

  private async loadAllRoles(): Promise<void> {
    this.allRoles.set(await firstValueFrom(this.roleService.getAll()).catch(() => []));
  }

  private async loadEffective(): Promise<void> {
    const userId = this.employee()?.appUserId;
    if (userId) {
      this.effective.set(await firstValueFrom(this.permissionService.getUserEffective(userId)).catch(() => null));
    }
  }

  private async afterOverride(targetUserId: string): Promise<void> {
    this.overrideForm.reset();
    await this.loadEffective();
    if (targetUserId === this.authStore.user()?.userId) await this.authStore.refreshPermissions();
  }

  private async run(request: () => ReturnType<RoleService['assignToUser']>, success: string): Promise<void> {
    try {
      await firstValueFrom(request());
      this.snackBar.open(success, 'Dismiss', { duration: 2500 });
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.snackBar.open(parsed.generalMessage, 'Dismiss', { duration: 4000 });
    }
  }
}
