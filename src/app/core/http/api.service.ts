import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly base = environment.apiUrl;

  protected get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, { params: this.toParams(params) });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  protected delete<T>(path: string, body?: unknown): Observable<T> {
    return body === undefined
      ? this.http.delete<T>(`${this.base}${path}`)
      : this.http.request<T>('DELETE', `${this.base}${path}`, { body });
  }

  private toParams(params?: Record<string, unknown>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
