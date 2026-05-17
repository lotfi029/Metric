import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DenyPermissionRequest,
  EffectivePermissionsResponse,
  GrantPermissionRequest,
  PermissionResponse,
  RevokePermissionRequest,
} from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class PermissionService extends ApiService {
  private readonly authStore = inject(AuthStore);

  getAll(): Observable<PermissionResponse[]> {
    return this.get<unknown>('/permissions').pipe(map(response => this.unwrapArray(response).map(permission => this.normalizePermission(permission))));
  }

  getRolePermissions(roleId: string): Observable<PermissionResponse[]> {
    return this.get<unknown>(`/permissions/role/${roleId}`).pipe(map(response => this.unwrapArray(response).map(permission => this.normalizePermission(permission))));
  }

  getUserEffective(userId: string): Observable<EffectivePermissionsResponse> {
    return this.get<unknown>(`/permissions/user/${userId}`).pipe(map(response => this.normalizeEffective(this.unwrap(response))));
  }

  getMyEffective(): Observable<EffectivePermissionsResponse> {
    return this.get<unknown>('/auth/me/permissions').pipe(map(response => this.normalizeEffective(this.unwrap(response))));
  }
  assignToRole(roleId: string, permissionName: string): Observable<unknown> { return this.post(`/permissions/${roleId}`, { permissionName }); }
  removeFromRole(roleId: string, permissionName: string): Observable<unknown> { return this.delete(`/permissions/${roleId}`, { permissionName }); }

  grant(req: GrantPermissionRequest): Observable<unknown> {
    return this.post('/permissions/grant', req).pipe(tap(() => this.refreshSelf(req.targetUserId)));
  }

  deny(req: DenyPermissionRequest): Observable<unknown> {
    return this.post('/permissions/deny', req).pipe(tap(() => this.refreshSelf(req.targetUserId)));
  }

  revoke(req: RevokePermissionRequest): Observable<unknown> {
    return this.delete('/permissions/revoke', req).pipe(tap(() => this.refreshSelf(req.targetUserId)));
  }

  private refreshSelf(targetUserId: string): void {
    if (targetUserId === this.authStore.user()?.userId) {
      void this.authStore.refreshPermissions();
    }
  }

  private normalizePermission(source: unknown): PermissionResponse {
    return {
      id: this.field<number>(source, 'id') ?? 0,
      roleId: this.field<string>(source, 'roleId') ?? '',
      group: this.field<string>(source, 'group') ?? '',
      name: this.field<string>(source, 'name', 'permissionName', 'permission') ?? '',
      displayName: this.field<string>(source, 'displayName') ?? this.field<string>(source, 'name') ?? '',
      description: this.field<string | null>(source, 'description') ?? null,
    };
  }

  private normalizeEffective(source: unknown): EffectivePermissionsResponse {
    const permissions = this.field<string[]>(source, 'permissions') ?? [];
    const overrides = this.unwrapArray(this.field<unknown>(source, 'overrides')).map(override => ({
      id: this.field<string>(override, 'id') ?? '',
      permission: this.field<string>(override, 'permission', 'name') ?? '',
      isGranted: this.field<boolean>(override, 'isGranted') ?? false,
      grantedById: this.field<string>(override, 'grantedById') ?? '',
      reason: this.field<string | null>(override, 'reason') ?? null,
      createdAt: this.field<string>(override, 'createdAt') ?? '',
      expiresAt: this.field<string | null>(override, 'expiresAt') ?? null,
    }));

    return {
      userId: this.field<string>(source, 'userId') ?? '',
      permissions,
      overrides,
    };
  }
}
