import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateDepartmentRequest, DepartmentResponse, EmployeeListResponse, UpdateDepartmentRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DepartmentService extends ApiService {
  getAll(): Observable<DepartmentResponse[]> {
    return this.get<unknown>('/departments').pipe(map(response => this.unwrapArray(response).map(department => this.normalizeDepartment(department))));
  }

  getById(id: string): Observable<DepartmentResponse> {
    return this.get<unknown>(`/departments/${id}`).pipe(map(response => this.normalizeDepartment(this.unwrap(response))));
  }

  getMembers(id: string): Observable<EmployeeListResponse[]> {
    return this.get<unknown>(`/departments/${id}/users`).pipe(map(response => this.unwrapArray(response).map(employee => this.normalizeEmployee(employee))));
  }

  create(req: CreateDepartmentRequest): Observable<unknown> { return this.post('/departments/create', req); }
  update(id: string, req: UpdateDepartmentRequest): Observable<unknown> { return this.put(`/departments/${id}/update`, req); }
  deleteDepartment(id: string): Observable<unknown> { return this.delete(`/departments/${id}`); }
  addEmployee(deptId: string, employeeId: string): Observable<unknown> { return this.post(`/departments/${deptId}/add-user`, { userId: employeeId }); }
  removeEmployee(deptId: string, employeeId: string): Observable<unknown> { return this.put(`/departments/${deptId}/remove-user`, { userId: employeeId }); }
  moveEmployee(deptId: string, employeeId: string, targetDepartmentId?: string): Observable<unknown> {
    return this.put(`/departments/${targetDepartmentId ?? deptId}/move-user`, { userId: employeeId });
  }
  assignHead(deptId: string, employeeId: string): Observable<unknown> { return this.put(`/departments/${deptId}/assign-head`, { userId: employeeId }); }
  removeHead(deptId: string): Observable<unknown> { return this.put(`/departments/${deptId}/assign-head`, { userId: null }); }

  private normalizeDepartment(source: unknown): DepartmentResponse {
    const head = this.field<unknown>(source, 'departmentHead', 'head');
    const departmentHeadId =
      this.field<string | null>(
        source,
        'departmentHeadId',
        'departmentHeadID',
        'headId',
        'headUserId',
      ) ??
      (head ? this.field<string | null>(head, 'id', 'employeeId', 'appUserId', 'userId') : null);
    return {
      id: this.field<string>(source, 'id', 'departmentId') ?? '',
      name: this.field<string>(source, 'name') ?? '',
      description: this.field<string | null>(source, 'description') ?? null,
      createdAt: this.field<string>(source, 'createdAt') ?? '',
      departmentHeadId: departmentHeadId ?? undefined,
      departmentHead: head ? this.normalizeEmployee(head) : null,
    };
  }

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
}
