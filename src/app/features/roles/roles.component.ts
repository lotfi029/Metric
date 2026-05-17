import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../core/constants/permissions';
import { PermissionResponse, RoleResponse } from '../../core/models';
import { AuthStore } from '../../core/auth/auth.store';
import { ErrorHandlerService } from '../../core/http/error-handler.service';
import { PermissionService } from '../../core/http/permission.service';
import { RoleService } from '../../core/http/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <header class="hero">
      <div>
        <p class="eyebrow">Access Control</p>
        <h1>Role Management</h1>
        <p>Create roles, rename custom roles, delete unused roles, and control role permissions.</p>
      </div>
      <div class="hero-stats">
        <article><span>Total roles</span><strong>{{ roles().length }}</strong></article>
        <article><span>Custom roles</span><strong>{{ customRoleCount() }}</strong></article>
        <article><span>Selected permissions</span><strong>{{ rolePermissions().length }}</strong></article>
      </div>
    </header>

    <div class="workspace">
      <aside class="role-nav">
        <section class="new-role-panel">
          <p class="panel-label">New role</p>
          <header class="section-head">
            <span class="mark">+</span>
            <div>
              <h2>Create role</h2>
              <p>Define a custom role, then select permissions from the workspace.</p>
            </div>
          </header>

          <form [formGroup]="createForm" (ngSubmit)="createRole()">
            <label class="field" for="create-role-name">
              <span>Role name</span>
              <input id="create-role-name" formControlName="roleName" autocomplete="off" placeholder="e.g. Design Lead">
              @if (createRoleNameError()) {
                <small>{{ createRoleNameError() }}</small>
              }
            </label>
            <p class="field-help">Example: Designer, Finance Lead, Project Viewer</p>
            @if (createError()) {
              <p class="error">{{ createError() }}</p>
            }
            <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid || isCreating()">
              <mat-spinner diameter="18" [class.is-hidden]="!isCreating()" />
              <span>{{ isCreating() ? 'Creating...' : 'Create role' }}</span>
            </button>
          </form>
          <div class="create-help">
            <span>Custom roles can be renamed, deleted, and assigned precise permissions.</span>
          </div>
        </section>

        <section class="existing-role-panel">
          <header class="section-head compact">
            <div>
              <p class="panel-label">Existing roles</p>
              <h2>Role library</h2>
              <p>{{ roles().length }} configured roles</p>
            </div>
          </header>

          <div class="role-sections">
            <section>
              <h3>System roles</h3>
              @for (role of systemRoles(); track role.id) {
                <button class="role-item system" [class.selected]="selectedRole()?.id === role.id" (click)="selectRole(role)">
                  <span class="role-name">{{ role.roleName }}</span>
                  <span class="role-kind">System</span>
                </button>
              } @empty {
                <div class="empty-state compact"><strong>No system roles</strong></div>
              }
            </section>

            <section>
              <h3>Custom roles</h3>
              @for (role of customRoles(); track role.id) {
                <button class="role-item custom" [class.selected]="selectedRole()?.id === role.id" (click)="selectRole(role)">
                  <span class="role-name">{{ role.roleName }}</span>
                  <span class="role-kind custom">Custom</span>
                </button>
              } @empty {
                <div class="empty-state compact"><strong>No custom roles yet</strong><span>Create one above.</span></div>
              }
            </section>
          </div>
          <!--
          @for (role of roles(); track role.id) {
            <button class="role-item" [class.selected]="selectedRole()?.id === role.id" (click)="selectRole(role)">
              <span class="role-name">{{ role.roleName }}</span>
              <span class="role-kind" [class.custom]="!isSystem(role)">{{ isSystem(role) ? 'System' : 'Custom' }}</span>
            </button>
          } @empty {
            <div class="empty-state compact">
              <strong>No roles found</strong>
              <span>Create a role to begin.</span>
            </div>
          }
          -->
        </section>
      </aside>

      <main class="role-main">
        @if (selectedRole(); as role) {
          <section class="surface selected-summary">
            <div>
              <p class="eyebrow">{{ isSystem(role) ? 'System role' : 'Custom role' }}</p>
              <h2 class="selected-role-name">{{ role.roleName }}</h2>
              <p>{{ isAllPermissionsRole(role) ? 'This role receives all permissions by default.' : 'Manage role name and permission assignment.' }}</p>
            </div>
            <div class="summary-actions">
              <span class="permission-count">{{ rolePermissions().length }} assigned</span>
            </div>
          </section>

          <section class="surface manage-role">
            <header class="section-head">
              <span class="mark">ED</span>
              <div>
                <h2>Role details</h2>
                <p>Rename or delete custom roles.</p>
              </div>
            </header>

            <form [formGroup]="editForm" class="edit-form" (ngSubmit)="updateRole()">
              <div class="field-row">
                <div class="field-block">
                  <label class="field" for="edit-role-name">
                    <span>Role name</span>
                    <input id="edit-role-name" formControlName="roleName" autocomplete="off">
                    @if (editRoleNameError()) {
                      <small>{{ editRoleNameError() }}</small>
                    }
                  </label>
                </div>
                <button class="role-update-button" mat-raised-button color="primary" type="submit" [disabled]="editForm.invalid || isUpdating() || isSystem(role)">
                  <mat-spinner diameter="18" [class.is-hidden]="!isUpdating()" />
                  <span>{{ isUpdating() ? 'Saving...' : 'Update role' }}</span>
                </button>
              </div>
              @if (!isSystem(role)) {
                <div class="danger-zone">
                  <div>
                    <strong>Delete role</strong>
                    <p>Remove this custom role permanently. Assigned users may lose role-based access.</p>
                  </div>
                  <button mat-stroked-button color="warn" type="button" [disabled]="isDeleting()" (click)="deleteSelectedRole()">
                    {{ isDeleting() ? 'Deleting...' : 'Delete role' }}
                  </button>
                </div>
              }
            </form>

            @if (isSystem(role)) {
              <p class="notice">System roles cannot be renamed or deleted.</p>
            }
          </section>

          <section class="surface permission-manager">
            <header class="permission-toolbar">
              <div>
                <h2>Permissions</h2>
                <p>Search and toggle permissions for this role.</p>
              </div>
              <label class="field search-field">
                <span>Search permissions</span>
                <input [formControl]="permissionSearch" placeholder="Permission name or key">
              </label>
            </header>

            @if (!canManagePermissions()) {
              <p class="notice">You can view permissions but cannot change them.</p>
            }

            <div class="permission-groups">
              @for (group of visibleGroups(); track group) {
                <section class="permission-group">
                  <header>
                    <div>
                      <h3>{{ group }}</h3>
                      <p>{{ activeCount(group) }} of {{ permissionsByGroup(group).length }} assigned</p>
                    </div>
                  </header>

                  <div class="permission-list">
                    @for (permission of permissionsByGroup(group); track permission.key) {
                      <article class="permission-card" [class.active]="hasPermission(permission.key)">
                        <div>
                          <strong>{{ permission.displayName }}</strong>
                          <small>{{ permission.key }}</small>
                        </div>
                        <mat-slide-toggle
                          [checked]="hasPermission(permission.key)"
                          [disabled]="!canManagePermissions() || isAllPermissionsRole(role) || isToggling(permission.key)"
                          (change)="toggle(permission.key, $event.checked)">
                        </mat-slide-toggle>
                      </article>
                    }
                  </div>
                </section>
              } @empty {
                <div class="empty-state">
                  <strong>No permissions match your search.</strong>
                  <span>Clear the search box to see all permissions.</span>
                </div>
              }
            </div>
          </section>
        } @else {
          <section class="surface empty-state">
            <strong>Select a role</strong>
            <span>Role details and permissions will appear here.</span>
          </section>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; color: #172033; }
    .hero { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: end; padding: clamp(22px, 4vw, 34px); margin-bottom: 18px; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: linear-gradient(135deg, rgba(2,13,24,.96), rgba(4,22,39,.92)), url("data:image/svg+xml,%3Csvg width='900' height='420' viewBox='0 0 900 420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='900' height='420' fill='%23041627'/%3E%3Cg stroke='%236cd3f7' opacity='.16'%3E%3Cpath d='M0 90h900M0 180h900M0 270h900M0 360h900M120 0v420M240 0v420M360 0v420M480 0v420M600 0v420M720 0v420M840 0v420'/%3E%3C/g%3E%3C/svg%3E"); background-size: cover; box-shadow: 0 22px 70px rgba(4, 22, 39, .16); }
    .hero::after { content: ""; position: absolute; right: -130px; bottom: -170px; width: 430px; height: 430px; background: radial-gradient(circle, rgba(108,211,247,.24), transparent 62%); }
    .hero > * { position: relative; z-index: 1; }
    .eyebrow { margin: 0 0 5px; color: #6cd3f7; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    h1, h2, h3 { margin: 0; letter-spacing: 0; }
    h1 { color: #fff; font-size: clamp(30px, 4vw, 44px); line-height: 1.04; }
    p { margin: 6px 0 0; color: #64748b; }
    .hero p { color: #c9d5e4; }
    .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); gap: 10px; }
    .hero-stats article { display: grid; gap: 4px; min-height: 74px; padding: 14px; border: 1px solid rgba(255,255,255,.12); border-radius: 8px; background: rgba(255,255,255,.08); backdrop-filter: blur(14px); }
    .hero-stats span { color: #9fb0c4; font: 800 11px/1.2 Manrope, sans-serif; text-transform: uppercase; }
    .hero-stats strong { color: #fff; font-size: 22px; }
    .workspace { display: grid; grid-template-columns: minmax(300px, 380px) minmax(0, 1fr); gap: 18px; align-items: start; }
    .role-nav, .role-main { display: grid; gap: 14px; }
    .surface { background: #fff; border: 1px solid #e1e7ef; border-radius: 8px; padding: 16px; box-shadow: 0 8px 24px rgba(4, 22, 39, .05); }
    .new-role-panel { background: #fff; border: 1px solid #e1e7ef; border-top: 4px solid #6cd3f7; border-radius: 8px; padding: 16px; box-shadow: 0 8px 24px rgba(4, 22, 39, .05); }
    .existing-role-panel { background: #fff; border: 1px solid #e1e7ef; border-radius: 8px; padding: 16px; box-shadow: 0 8px 24px rgba(4, 22, 39, .05); }
    .panel-label { margin: 0 0 6px; color: #0073e6; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .section-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .section-head.compact { margin-bottom: 8px; }
    .mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; background: #e0f5fe; color: #006e8c; font-size: 12px; font-weight: 900; flex: 0 0 auto; }
    form { display: grid; gap: 10px; }
    .field-block { display: grid; gap: 6px; }
    .field-help { margin: -2px 0 0; color: #64748b; font-size: 12px; }
    .create-help { margin-top: 12px; padding: 10px; border-radius: 8px; background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: 700; }
    .field { display: grid; gap: 8px; color: #041627; }
    .field span { color: #344054; font-size: 13px; font-weight: 800; }
    .field input { width: 100%; height: 50px; border: 1px solid #d7dee8; border-radius: 8px; background: #fff; color: #041627; font: 600 15px/1.2 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif; outline: none; padding: 0 14px; transition: border-color .15s ease, box-shadow .15s ease; }
    .field input::placeholder { color: #9aa4b2; font-weight: 500; }
    .field input:focus { border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,.12); }
    .field small { color: #ba1a1a; font-size: 12px; font-weight: 700; }
    button mat-spinner { display: inline-block; margin-right: 8px; }
    .is-hidden { display: none !important; }
    .error, .notice { margin: 0; padding: 10px 12px; border-radius: 8px; font-weight: 700; }
    .error { background: #fee2e2; color: #991b1b; }
    .notice { background: #eff6ff; color: #1e40af; }
    .role-sections { display: grid; gap: 16px; }
    .role-sections section { display: grid; gap: 8px; }
    .role-sections h3 { font-size: 13px; color: #475569; text-transform: uppercase; }
    .role-item { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
    .role-item:hover, .role-item.selected { border-color: #b9e9f8; background: #e0f5fe; }
    .role-item.custom { background: #fbfdfc; border-color: #dcfce7; }
    .role-item.custom.selected { background: #f0fdf4; border-color: #86efac; }
    .role-item.system { background: #f8fafc; }
    .role-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 900; }
    .role-kind, .permission-count { width: fit-content; padding: 5px 9px; border-radius: 999px; background: #eef2f7; color: #64748b; font-size: 12px; font-weight: 900; }
    .role-kind.custom { background: #f0fdf4; color: #166534; }
    .selected-summary { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .selected-role-name { font: 900 28px/1.15 Manrope, sans-serif; color: #0f172a; }
    .manage-role { display: grid; gap: 12px; }
    .edit-form { display: grid; gap: 12px; }
    .field-row { display: grid; grid-template-columns: minmax(260px, 1fr) auto; gap: 10px; align-items: start; }
    .role-update-button {
      min-width: 150px;
      min-height: 48px;
      margin-top: 21px;
      border-radius: 8px;
      font: 900 14px/1.2 Manrope, sans-serif;
      letter-spacing: 0;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
    }
    .danger-zone { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 12px; border: 1px solid #fecdd3; border-radius: 8px; background: #fff1f2; }
    .danger-zone p { margin-top: 3px; color: #9f1239; }
    .edit-form button, .new-role-panel button { min-height: 42px; }
    .permission-manager { display: grid; gap: 14px; }
    .permission-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 360px); gap: 16px; align-items: start; }
    .permission-groups { display: grid; gap: 14px; }
    .permission-group { display: grid; gap: 10px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
    .permission-group header { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .permission-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .permission-card { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
    .permission-card.active { border-color: #bbf7d0; background: #f0fdf4; }
    .permission-card strong, .permission-card small { display: block; overflow-wrap: anywhere; }
    .permission-card small, .empty-state span { color: #64748b; }
    .empty-state { display: grid; place-items: center; gap: 6px; min-height: 140px; text-align: center; color: #64748b; }
    .empty-state.compact { min-height: 96px; }
    @media (max-width: 1100px) {
      .hero, .workspace, .hero-stats, .permission-toolbar, .permission-list { grid-template-columns: 1fr; }
      .selected-summary, .field-row, .danger-zone { grid-template-columns: 1fr; display: grid; }
    }
  `],
})
export class RolesComponent {
  readonly PERMISSIONS = PERMISSIONS;
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly errors = inject(ErrorHandlerService);

  readonly roles = signal<RoleResponse[]>([]);
  readonly selectedRole = signal<RoleResponse | null>(null);
  readonly rolePermissions = signal<PermissionResponse[]>([]);
  readonly permissionSearch = new FormControl('', { nonNullable: true });
  readonly searchTerm = signal('');
  readonly togglingPermission = signal<string | null>(null);
  readonly createForm = this.fb.nonNullable.group({
    roleName: ['', [Validators.required, Validators.maxLength(80)]],
  });
  readonly editForm = this.fb.nonNullable.group({
    roleName: ['', [Validators.required, Validators.maxLength(80)]],
  });
  readonly isCreating = signal(false);
  readonly isUpdating = signal(false);
  readonly isDeleting = signal(false);
  readonly createError = signal('');
  readonly customRoleCount = computed(() => this.roles().filter((role) => !this.isSystem(role)).length);
  readonly systemRoles = computed(() => this.roles().filter((role) => this.isSystem(role)));
  readonly customRoles = computed(() => this.roles().filter((role) => !this.isSystem(role)));
  readonly visibleGroups = computed(() => this.groups().filter((group) => this.permissionsByGroup(group).length > 0));

  constructor() {
    this.permissionSearch.valueChanges.subscribe((value) => this.searchTerm.set(value));
    void this.loadRoles();
  }

  groups(): string[] {
    return [...new Set(ALL_PERMISSIONS.map((permission) => permission.group))];
  }

  permissionsByGroup(group: string) {
    const term = this.searchTerm().trim().toLowerCase();
    return ALL_PERMISSIONS.filter((permission) => {
      const matchesGroup = permission.group === group;
      const matchesSearch =
        !term ||
        permission.displayName.toLowerCase().includes(term) ||
        permission.key.toLowerCase().includes(term);
      return matchesGroup && matchesSearch;
    });
  }

  hasPermission(permission: string): boolean {
    return this.rolePermissions().some((item) => item.name === permission);
  }

  activeCount(group: string): number {
    return this.permissionsByGroup(group).filter((permission) => this.hasPermission(permission.key)).length;
  }

  isSystem(role: RoleResponse): boolean {
    return ['admin', 'manager', 'departmenthead', 'employee', 'client'].includes(role.roleName.toLowerCase());
  }

  isAllPermissionsRole(role: RoleResponse): boolean {
    return ['admin', 'manager'].includes(role.roleName.toLowerCase());
  }

  canManagePermissions(): boolean {
    return (
      this.authStore.can(PERMISSIONS.permissions.assignToRole) ||
      this.authStore.can(PERMISSIONS.permissions.removeFromRole)
    );
  }

  isToggling(permission: string): boolean {
    return this.togglingPermission() === permission;
  }

  createRoleNameError(): string {
    return this.roleNameError(this.createForm.controls.roleName);
  }

  editRoleNameError(): string {
    return this.roleNameError(this.editForm.controls.roleName);
  }

  async selectRole(role: RoleResponse): Promise<void> {
    this.selectedRole.set(role);
    this.editForm.patchValue({ roleName: role.roleName });
    this.rolePermissions.set(await firstValueFrom(this.permissionService.getRolePermissions(role.id)).catch(() => []));
  }

  async createRole(): Promise<void> {
    if (this.createForm.invalid || this.isCreating()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const roleName = this.createForm.controls.roleName.value.trim();
    if (!roleName) {
      this.createForm.controls.roleName.setErrors({ required: true });
      this.createForm.controls.roleName.markAsTouched();
      return;
    }

    try {
      this.isCreating.set(true);
      this.createError.set('');
      await firstValueFrom(this.roleService.create(roleName));
      this.snackBar.open('Role created.', 'Dismiss', { duration: 2500 });
      this.createForm.reset();
      await this.loadRoles(roleName);
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.createError.set(parsed.generalMessage);
      this.errors.applyToForm(this.createForm, parsed.fieldErrors);
      this.snackBar.open(parsed.generalMessage || 'Role create failed.', 'Dismiss', { duration: 4000 });
    } finally {
      this.isCreating.set(false);
    }
  }

  async updateRole(): Promise<void> {
    const role = this.selectedRole();
    if (!role || this.editForm.invalid || this.isUpdating()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const roleName = this.editForm.controls.roleName.value.trim();
    if (!roleName) {
      this.editForm.controls.roleName.setErrors({ required: true });
      this.editForm.controls.roleName.markAsTouched();
      return;
    }

    try {
      this.isUpdating.set(true);
      await firstValueFrom(this.roleService.update(role.id, roleName));
      this.snackBar.open('Role updated.', 'Dismiss', { duration: 2500 });
      await this.loadRoles(roleName);
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.errors.applyToForm(this.editForm, parsed.fieldErrors);
      this.snackBar.open(parsed.generalMessage || 'Role update failed.', 'Dismiss', { duration: 4000 });
    } finally {
      this.isUpdating.set(false);
    }
  }

  async deleteSelectedRole(): Promise<void> {
    const role = this.selectedRole();
    if (!role || this.isDeleting()) return;

    const confirmed = window.confirm(`Delete role "${role.roleName}"?`);
    if (!confirmed) return;

    try {
      this.isDeleting.set(true);
      await firstValueFrom(this.roleService.deleteRole(role.id));
      this.snackBar.open('Role deleted.', 'Dismiss', { duration: 2500 });
      this.selectedRole.set(null);
      this.rolePermissions.set([]);
      await this.loadRoles();
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.snackBar.open(parsed.generalMessage || 'Role delete failed.', 'Dismiss', { duration: 4000 });
    } finally {
      this.isDeleting.set(false);
    }
  }

  async toggle(permissionName: string, checked: boolean): Promise<void> {
    const role = this.selectedRole();
    if (!role || this.togglingPermission()) return;

    const previous = this.rolePermissions();
    try {
      this.togglingPermission.set(permissionName);
      if (checked) {
        await firstValueFrom(this.permissionService.assignToRole(role.id, permissionName));
      } else {
        await firstValueFrom(this.permissionService.removeFromRole(role.id, permissionName));
      }
      await this.selectRole(role);
      this.snackBar.open(checked ? 'Permission assigned.' : 'Permission removed.', 'Dismiss', {
        duration: 1800,
      });
    } catch (error: any) {
      this.rolePermissions.set(previous);
      const parsed = this.errors.parseHttpError(error);
      this.snackBar.open(parsed.generalMessage || 'Permission update failed.', 'Dismiss', {
        duration: 4000,
      });
    } finally {
      this.togglingPermission.set(null);
    }
  }

  private roleNameError(control: typeof this.createForm.controls.roleName): string {
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Role name is required.';
    if (control.hasError('maxlength')) return 'Use 80 characters or fewer.';
    if (control.hasError('serverError')) return control.getError('serverError');
    return '';
  }

  private async loadRoles(selectRoleName?: string): Promise<void> {
    const roles = await firstValueFrom(this.roleService.getAll()).catch(() => []);
    this.roles.set(roles);
    const target = selectRoleName
      ? roles.find((role) => role.roleName.toLowerCase() === selectRoleName.toLowerCase())
      : roles.find((role) => role.id === this.selectedRole()?.id) ?? roles[0];
    if (target) {
      await this.selectRole(target);
    }
  }
}
