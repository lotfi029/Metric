import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEmployeeRequest, EmployeeListResponse, EmployeeQueryFilter, EmployeeResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends ApiService {
  getById(id: string): Observable<EmployeeResponse> { return this.get(`/employees/${id}`); }
  getAll(filter: EmployeeQueryFilter = {}): Observable<EmployeeListResponse[]> { return this.post('/employees/get-all', filter); }
  create(req: CreateEmployeeRequest): Observable<string> { return this.post('/employees', req); }
  deactivate(id: string): Observable<unknown> { return this.post(`/employees/${id}/deactivate`, {}); }
  activate(id: string): Observable<unknown> { return this.post(`/employees/${id}/activate`, {}); }
}
