import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends ApiService {
  getAll(): Observable<RoleResponse[]> {
    return this.get<unknown>('/roles').pipe(map(response => this.unwrapArray(response).map(role => this.normalizeRole(role))));
  }

  getUserRoles(userId: string): Observable<RoleResponse[]> {
    return this.get<unknown>(`/roles/user/${userId}`).pipe(map(response => this.unwrapArray(response).map(role => this.normalizeRole(role))));
  }

  create(roleName: string): Observable<unknown> { return this.post('/roles/create', { roleName }); }
  update(roleId: string, newName: string): Observable<unknown> { return this.put('/roles/update', { roleId, newRoleName: newName }); }
  deleteRole(roleId: string): Observable<unknown> { return this.delete(`/roles/${roleId}`); }
  assignToUser(userId: string, roleId: string): Observable<unknown> { return this.post('/roles/assign-to-user', { userId, roleId }); }
  removeFromUser(userId: string, roleId: string): Observable<unknown> { return this.post('/roles/remove-from-user', { userId, roleId }); }

  private normalizeRole(source: unknown): RoleResponse {
    const roleName = this.field<string>(source, 'roleName', 'name') ?? '';
    return {
      id: this.field<string>(source, 'id', 'roleId') ?? roleName,
      roleName,
    };
  }
}
