import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends ApiService {
  getAll(): Observable<RoleResponse[]> { return this.get('/roles'); }
  getUserRoles(userId: string): Observable<RoleResponse[]> { return this.get(`/roles/user/${userId}`); }
  create(roleName: string): Observable<unknown> { return this.post('/roles/create', { roleName }); }
  update(roleId: string, newName: string): Observable<unknown> { return this.put('/roles/update', { roleId, newRoleName: newName }); }
  deleteRole(roleId: string): Observable<unknown> { return this.delete(`/roles/${roleId}`); }
  assignToUser(userId: string, roleId: string): Observable<unknown> { return this.post('/roles/assign-to-user', { userId, roleId }); }
  removeFromUser(userId: string, roleId: string): Observable<unknown> { return this.post('/roles/remove-from-user', { userId, roleId }); }
}
