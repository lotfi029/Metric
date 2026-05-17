import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddUserRequest, DetailedUserResponse, UpdateUserRequest, UserListResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  getAll(): Observable<UserListResponse[]> {
    return this.get<unknown>('/users').pipe(map(response => this.unwrapArray(response).map(user => this.normalizeUser(user))));
  }

  getById(id: string): Observable<DetailedUserResponse> {
    return this.get<unknown>(`/users/${id}`).pipe(map(response => this.normalizeDetailedUser(this.unwrap(response))));
  }

  getMe(): Observable<DetailedUserResponse> {
    return this.get<unknown>('/users/me').pipe(map(response => this.normalizeDetailedUser(this.unwrap(response))));
  }

  create(req: AddUserRequest): Observable<unknown> { return this.post('/users/create', req); }
  update(id: string, req: UpdateUserRequest): Observable<unknown> { return this.put(`/users/${id}/update`, req); }
  deactivate(id: string): Observable<unknown> { return this.post(`/users/${id}/deactivate`, {}); }
  activate(id: string): Observable<unknown> { return this.post(`/users/${id}/activate`, {}); }
  deleteUser(id: string): Observable<unknown> { return this.delete(`/users/${id}`); }

  private normalizeUser(source: unknown): UserListResponse {
    return {
      id: this.field<string>(source, 'id', 'userId') ?? '',
      firstName: this.field<string>(source, 'firstName') ?? '',
      lastName: this.field<string>(source, 'lastName') ?? '',
      userName: this.field<string>(source, 'userName', 'username') ?? '',
      email: this.field<string>(source, 'email') ?? '',
      userType: this.field<string>(source, 'userType') ?? '',
      isActive: this.field<boolean>(source, 'isActive') ?? false,
      createdAt: this.field<string>(source, 'createdAt') ?? '',
      lastLoginAt: this.field<string | null>(source, 'lastLoginAt') ?? null,
    };
  }

  private normalizeDetailedUser(source: unknown): DetailedUserResponse {
    return {
      ...this.normalizeUser(source),
      phoneNumber: this.field<string | null>(source, 'phoneNumber', 'phone') ?? null,
      roles: this.field<string[]>(source, 'roles') ?? [],
    };
  }
}
