import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

  getAll(): Observable<PermissionResponse[]> { return this.get('/permissions'); }
  getRolePermissions(roleId: string): Observable<PermissionResponse[]> { return this.get(`/permissions/role/${roleId}`); }
  getUserEffective(userId: string): Observable<EffectivePermissionsResponse> { return this.get(`/permissions/user/${userId}`); }
  getMyEffective(): Observable<EffectivePermissionsResponse> { return this.get('/permissions/me'); }
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
}
