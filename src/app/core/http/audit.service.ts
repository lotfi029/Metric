import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditPagedResult, AuditQueryParams, AuditLogResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuditService extends ApiService {
  getLogs(params: AuditQueryParams = {}): Observable<AuditPagedResult> { return this.get('/audit', { ...params }); }
  getEntityHistory(entityName: string, entityId: string): Observable<AuditLogResponse[]> { return this.get(`/audit/entity/${entityName}/${entityId}`); }
  getMyActivity(): Observable<AuditLogResponse[]> { return this.get('/audit/my-activity'); }
  getUserActivity(userId: string): Observable<AuditLogResponse[]> { return this.get(`/audit/user/${userId}`); }
}
