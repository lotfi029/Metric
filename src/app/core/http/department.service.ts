import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDepartmentRequest, DepartmentResponse, EmployeeListResponse, UpdateDepartmentRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DepartmentService extends ApiService {
  getAll(): Observable<DepartmentResponse[]> { return this.get('/departments'); }
  getById(id: string): Observable<DepartmentResponse> { return this.get(`/departments/${id}`); }
  getMembers(id: string): Observable<EmployeeListResponse[]> { return this.get(`/departments/${id}/users`); }
  create(req: CreateDepartmentRequest): Observable<unknown> { return this.post('/departments/create', req); }
  update(id: string, req: UpdateDepartmentRequest): Observable<unknown> { return this.put(`/departments/${id}/update`, req); }
  deleteDepartment(id: string): Observable<unknown> { return this.delete(`/departments/${id}`); }
  addEmployee(deptId: string, employeeId: string): Observable<unknown> { return this.post(`/departments/${deptId}/add-user`, { userId: employeeId }); }
  removeEmployee(deptId: string, employeeId: string): Observable<unknown> { return this.put(`/departments/${deptId}/remove-user`, { userId: employeeId }); }
  moveEmployee(deptId: string, employeeId: string): Observable<unknown> { return this.put(`/departments/${deptId}/move-user`, { userId: employeeId }); }
  assignHead(deptId: string, employeeId: string): Observable<unknown> { return this.put(`/departments/${deptId}/assign-head`, { userId: employeeId }); }
}
