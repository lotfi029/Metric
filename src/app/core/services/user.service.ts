import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserListResponse, DetailedUserResponse, AddUserRequest, UpdateUserRequest, CreateUserResponse } from '../models/user.model';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<UserListResponse[]>(this.apiUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getCurrentUser() {
    return this.http.get<DetailedUserResponse>(`${this.apiUrl}/me`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getUserById(id: string) {
    return this.http.get<DetailedUserResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  createUser(request: AddUserRequest) {
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/create`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  updateUser(id: string, request: UpdateUserRequest) {
    return this.http.put(`${this.apiUrl}/${id}/update`, request).pipe(
      catchError(err => this.handleError(err))
    );
  }

  activateUser(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/activate`, {}).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deactivateUser(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      catchError(err => this.handleError(err))
    );
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any) {
    console.error('User service error:', error);
    return throwError(() => error);
  }
}
