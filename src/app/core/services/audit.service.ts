import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuditLogResponse, AuditPagedResult, AuditLogQuery } from '../models/audit.model';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getLogs(query: AuditLogQuery = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<AuditPagedResult>(this.apiUrl, { params }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getEntityHistory(entityName: string, entityId: string) {
    return this.http.get<AuditLogResponse[]>(
      `${this.apiUrl}/entity/${entityName}/${entityId}`
    ).pipe(catchError(err => throwError(() => err)));
  }

  getMyActivity() {
    return this.http.get<AuditLogResponse[]>(`${this.apiUrl}/my-activity`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getUserActivity(userId: string) {
    return this.http.get<AuditLogResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
