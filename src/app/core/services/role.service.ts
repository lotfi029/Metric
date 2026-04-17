import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoleResponse, CreateRoleCommand, UpdateRoleCommand, AssignRoleToUserCommand } from '../models/role.model';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  getRoles() {
    return this.http.get<RoleResponse[]>(this.apiUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getUserRoles(userId: string) {
    return this.http.get<RoleResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createRole(request: CreateRoleCommand) {
    return this.http.post<RoleResponse>(`${this.apiUrl}/create`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateRole(request: UpdateRoleCommand) {
    return this.http.put<RoleResponse>(`${this.apiUrl}/update`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deleteRole(roleId: string) {
    return this.http.delete(`${this.apiUrl}/${roleId}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  assignRoleToUser(request: AssignRoleToUserCommand) {
    return this.http.post(`${this.apiUrl}/assign-to-user`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  removeRoleFromUser(request: AssignRoleToUserCommand) {
    return this.http.post(`${this.apiUrl}/remove-from-user`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any) {
    console.error('Role service error:', error);
    return throwError(() => error);
  }
}
