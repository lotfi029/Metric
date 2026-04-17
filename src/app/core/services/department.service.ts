import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DepartmentResponse, CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentUserRequest } from '../models/department.model';
import { UserListResponse } from '../models/user.model';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) { }

  getDepartments() {
    return this.http.get<DepartmentResponse[]>(this.apiUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getDepartmentById(id: string) {
    return this.http.get<DepartmentResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getDepartmentUsers(id: string) {
    return this.http.get<UserListResponse[]>(`${this.apiUrl}/${id}/users`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createDepartment(request: CreateDepartmentRequest) {
    return this.http.post<DepartmentResponse>(`${this.apiUrl}/create`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateDepartment(id: string, request: UpdateDepartmentRequest) {
    return this.http.put(`${this.apiUrl}/${id}/update`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deleteDepartment(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  addUserToDepartment(departmentId: string, request: DepartmentUserRequest) {
    return this.http.post(`${this.apiUrl}/${departmentId}/add-user`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  removeUserFromDepartment(departmentId: string, request: DepartmentUserRequest) {
    return this.http.put(`${this.apiUrl}/${departmentId}/remove-user`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  moveUserToDepartment(departmentId: string, request: DepartmentUserRequest) {
    return this.http.put(`${this.apiUrl}/${departmentId}/move-user`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any) {
    console.error('Department service error:', error);
    return throwError(() => error);
  }
}
