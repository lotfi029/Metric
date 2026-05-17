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

  protected unwrap<T = unknown>(response: unknown): T {
    const value = response as Record<string, unknown> | null;
    if (value && typeof value === 'object') {
      if ('value' in value) return value['value'] as T;
      if ('Value' in value) return value['Value'] as T;
      if ('result' in value) return value['result'] as T;
      if ('Result' in value) return value['Result'] as T;
    }
    return response as T;
  }

  protected unwrapArray<T = unknown>(response: unknown): T[] {
    const unwrapped = this.unwrap<unknown>(response);
    const value = unwrapped as Record<string, unknown> | null;
    if (Array.isArray(unwrapped)) return unwrapped as T[];
    if (value && typeof value === 'object') {
      if (Array.isArray(value['items'])) return value['items'] as T[];
      if (Array.isArray(value['Items'])) return value['Items'] as T[];
      if (Array.isArray(value['data'])) return value['data'] as T[];
      if (Array.isArray(value['Data'])) return value['Data'] as T[];
    }
    return [];
  }

  protected field<T>(source: unknown, ...keys: string[]): T | undefined {
    const value = source as Record<string, unknown> | null;
    if (!value || typeof value !== 'object') return undefined;
    for (const key of keys) {
      if (key in value) return value[key] as T;
      const match = Object.keys(value).find(existing => existing.toLowerCase() === key.toLowerCase());
      if (match) return value[match] as T;
    }
    return undefined;
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
