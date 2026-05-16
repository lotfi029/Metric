import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddUserRequest, DetailedUserResponse, UpdateUserRequest, UserListResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  getAll(): Observable<UserListResponse[]> { return this.get('/users'); }
  getById(id: string): Observable<DetailedUserResponse> { return this.get(`/users/${id}`); }
  getMe(): Observable<DetailedUserResponse> { return this.get('/users/me'); }
  create(req: AddUserRequest): Observable<unknown> { return this.post('/users/create', req); }
  update(id: string, req: UpdateUserRequest): Observable<unknown> { return this.put(`/users/${id}/update`, req); }
  deactivate(id: string): Observable<unknown> { return this.post(`/users/${id}/deactivate`, {}); }
  activate(id: string): Observable<unknown> { return this.post(`/users/${id}/activate`, {}); }
  deleteUser(id: string): Observable<unknown> { return this.delete(`/users/${id}`); }
}
