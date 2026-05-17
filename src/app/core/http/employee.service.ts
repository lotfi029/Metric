import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateEmployeeRequest, EmployeeListResponse, EmployeeQueryFilter, EmployeeResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends ApiService {
  getById(id: string): Observable<EmployeeResponse> {
    return this.get<unknown>(`/employees/${id}`).pipe(map(response => this.normalizeEmployeeResponse(this.unwrap(response))));
  }

  getAll(filter: EmployeeQueryFilter = {}): Observable<EmployeeListResponse[]> {
    return this.post<unknown>('/employees/get-all', filter).pipe(map(response => this.unwrapArray(response).map(employee => this.normalizeEmployee(employee))));
  }

  create(req: CreateEmployeeRequest): Observable<string> {
    return this.post<unknown>('/employees', req).pipe(map(response => this.unwrap<string>(response)));
  }

  deactivate(id: string): Observable<unknown> { return this.post(`/employees/${id}/deactivate`, {}); }
  activate(id: string): Observable<unknown> { return this.post(`/employees/${id}/activate`, {}); }

  private normalizeEmployee(source: unknown): EmployeeListResponse {
    return {
      id: this.field<string>(source, 'id', 'employeeId') ?? '',
      appUserId: this.field<string>(source, 'appUserId', 'userId', 'applicationUserId') ?? '',
      firstName: this.field<string>(source, 'firstName') ?? '',
      lastName: this.field<string>(source, 'lastName') ?? '',
      email: this.field<string>(source, 'email') ?? '',
      jobTitle: this.field<string>(source, 'jobTitle') ?? '',
      isActive: this.field<boolean>(source, 'isActive') ?? false,
      departmentId: this.field<string | null>(source, 'departmentId') ?? null,
      departmentName: this.field<string | null>(source, 'departmentName') ?? null,
    };
  }

  private normalizeEmployeeResponse(source: unknown): EmployeeResponse {
    const base = this.normalizeEmployee(source);
    return {
      ...base,
      userName: this.field<string>(source, 'userName', 'username') ?? '',
      hireDate: this.field<string>(source, 'hireDate') ?? '',
      createdAt: this.field<string>(source, 'createdAt') ?? '',
      lastLoginAt: this.field<string | null>(source, 'lastLoginAt') ?? null,
      notes: this.field<string | null>(source, 'notes') ?? null,
    };
  }
}
