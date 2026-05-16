import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../core/constants/permissions';
import { PermissionResponse, RoleResponse } from '../../core/models';
import { AuthStore } from '../../core/auth/auth.store';
import { PermissionService } from '../../core/http/permission.service';
import { RoleService } from '../../core/http/role.service';
import { HasPermissionDirective } from '../../shared/directives';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatTooltipModule, HasPermissionDirective],
  template: `
    <div class="layout">
      <aside class="roles-panel">
        <h1>Roles</h1>
        <form [formGroup]="createForm" *appHasPermission="PERMISSIONS.roles.create" class="create">
          <mat-form-field appearance="outline"><mat-label>Role name</mat-label><input matInput formControlName="roleName"></mat-form-field>
          <button mat-raised-button color="primary" type="button" (click)="createRole()">Create</button>
        </form>
        @for (role of roles(); track role.id) {
          <button class="role-item" [class.selected]="selectedRole()?.id === role.id" (click)="selectRole(role)">
            <span>{{ role.roleName }}</span>
            @if (isSystem(role)) { <small>System</small> }
          </button>
        }
      </aside>
      <section class="matrix">
        @if (selectedRole(); as role) {
          <header><h2>Permissions for {{ role.roleName }}</h2></header>
          @if (!authStore.can(PERMISSIONS.permissions.assignToRole)) {
            <p class="info">You can view permissions but cannot modify them.</p>
          }
          @for (group of groups(); track group) {
            <mat-expansion-panel expanded>
              <mat-expansion-panel-header>{{ group }} ({{ activeCount(group) }})</mat-expansion-panel-header>
              @for (permission of permissionsByGroup(group); track permission.key) {
                <div class="perm-row">
                  <span><strong>{{ permission.displayName }}</strong><small>{{ permission.key }}</small></span>
                  <mat-slide-toggle
                    [checked]="hasPermission(permission.key)"
                    [disabled]="!authStore.can(PERMISSIONS.permissions.assignToRole) || isAllPermissionsRole(role)"
                    matTooltip="{{ isAllPermissionsRole(role) ? 'Admin and Manager have all permissions by default' : '' }}"
                    (change)="toggle(permission.key, $event.checked)">
                  </mat-slide-toggle>
                </div>
              }
            </mat-expansion-panel>
          }
        } @else {
          <p>Select a role to view its permission matrix.</p>
        }
      </section>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
    .roles-panel, .matrix { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    h1, h2 { margin: 0 0 16px; } .create { display: grid; gap: 8px; margin-bottom: 14px; }
    .role-item { width: 100%; display: flex; justify-content: space-between; align-items: center; border: 0; background: transparent; padding: 12px; border-radius: 8px; text-align: left; cursor: pointer; }
    .role-item:hover, .role-item.selected { background: #eff6ff; color: #1d4ed8; }
    small { display: block; color: #64748b; } .info { padding: 12px; background: #eff6ff; color: #1e40af; border-radius: 8px; }
    .perm-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  `],
})
export class RolesComponent {
  readonly PERMISSIONS = PERMISSIONS;
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly snackBar = inject(MatSnackBar);
  readonly roles = signal<RoleResponse[]>([]);
  readonly selectedRole = signal<RoleResponse | null>(null);
  readonly rolePermissions = signal<PermissionResponse[]>([]);
  readonly groups = computed(() => [...new Set(ALL_PERMISSIONS.map(permission => permission.group))]);
  readonly createForm = this.fb.nonNullable.group({ roleName: ['', Validators.required] });

  constructor() {
    void this.loadRoles();
  }

  permissionsByGroup(group: string) { return ALL_PERMISSIONS.filter(permission => permission.group === group); }
  hasPermission(permission: string): boolean { return this.rolePermissions().some(item => item.name === permission); }
  activeCount(group: string): number { return this.permissionsByGroup(group).filter(permission => this.hasPermission(permission.key)).length; }
  isSystem(role: RoleResponse): boolean { return ['admin', 'manager', 'departmenthead', 'employee', 'client'].includes(role.roleName.toLowerCase()); }
  isAllPermissionsRole(role: RoleResponse): boolean { return ['admin', 'manager'].includes(role.roleName.toLowerCase()); }

  async selectRole(role: RoleResponse): Promise<void> {
    this.selectedRole.set(role);
    this.rolePermissions.set(await firstValueFrom(this.permissionService.getRolePermissions(role.id)).catch(() => []));
  }

  async createRole(): Promise<void> {
    if (this.createForm.invalid) return;
    await firstValueFrom(this.roleService.create(this.createForm.controls.roleName.value));
    this.createForm.reset();
    await this.loadRoles();
  }

  async toggle(permissionName: string, checked: boolean): Promise<void> {
    const role = this.selectedRole();
    if (!role) return;
    const previous = this.rolePermissions();
    try {
      if (checked) {
        await firstValueFrom(this.permissionService.assignToRole(role.id, permissionName));
      } else {
        await firstValueFrom(this.permissionService.removeFromRole(role.id, permissionName));
      }
      await this.selectRole(role);
    } catch {
      this.rolePermissions.set(previous);
      this.snackBar.open('Permission update failed.', 'Dismiss', { duration: 3000 });
    }
  }

  private async loadRoles(): Promise<void> {
    const roles = await firstValueFrom(this.roleService.getAll()).catch(() => []);
    this.roles.set(roles);
    if (!this.selectedRole() && roles[0]) await this.selectRole(roles[0]);
  }
}
