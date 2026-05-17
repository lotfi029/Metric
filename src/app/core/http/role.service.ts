import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RoleResponse } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class RoleService extends ApiService {
  private readonly authStore = inject(AuthStore);

  getAll(): Observable<RoleResponse[]> {
    return this.get<unknown>('/roles').pipe(map(response => this.unwrapArray(response).map(role => this.normalizeRole(role))));
  }

  getUserRoles(userId: string): Observable<RoleResponse[]> {
    return this.get<unknown>(`/roles/user/${userId}`).pipe(map(response => this.unwrapArray(response).map(role => this.normalizeRole(role))));
  }

  create(roleName: string): Observable<unknown> { return this.post('/roles/create', { roleName }); }
  update(roleId: string, newName: string): Observable<unknown> { return this.put('/roles/update', { roleId, newRoleName: newName }); }
  deleteRole(roleId: string): Observable<unknown> { return this.delete(`/roles/${roleId}`); }
  assignToUser(userId: string, roleId: string): Observable<unknown> {
    return this.post('/roles/assign-to-user', { userId, roleId }).pipe(tap(() => this.refreshSelf(userId)));
  }

  removeFromUser(userId: string, roleId: string): Observable<unknown> {
    return this.post('/roles/remove-from-user', { userId, roleId }).pipe(tap(() => this.refreshSelf(userId)));
  }

  private refreshSelf(userId: string): void {
    if (userId === this.authStore.user()?.userId) {
      void this.authStore.refreshPermissions();
    }
  }

  private normalizeRole(source: unknown): RoleResponse {
    const roleName = this.field<string>(source, 'roleName', 'name') ?? '';
    return {
      id: this.field<string>(source, 'id', 'roleId') ?? roleName,
      roleName,
    };
  }
}
