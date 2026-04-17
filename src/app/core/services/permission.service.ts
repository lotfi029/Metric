import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PermissionResponse, PermissionRequest } from '../models/permission.model';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) { }

  getPermissions() {
    return this.http.get<PermissionResponse[]>(this.apiUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getRolePermissions(roleId: string) {
    return this.http.get<PermissionResponse[]>(`${this.apiUrl}/role/${roleId}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getUserPermissions(userId: string) {
    return this.http.get<PermissionResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createPermission(roleId: string, request: PermissionRequest) {
    return this.http.post(`${this.apiUrl}/${roleId}/create`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deletePermission(roleId: string, request: PermissionRequest) {
    return this.http.delete(`${this.apiUrl}/${roleId}/delete`, { body: request }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any) {
    console.error('Permission service error:', error);
    return throwError(() => error);
  }
}
