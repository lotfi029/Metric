import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientResponse, CreateClientRequest, UpdateClientRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ClientService extends ApiService {
  getAll(): Observable<ClientResponse[]> {
    return this.get<unknown>('/clients').pipe(map(response => this.unwrapArray(response).map(client => this.normalizeClient(client))));
  }

  getById(id: string): Observable<ClientResponse> {
    return this.get<unknown>(`/clients/${id}`).pipe(map(response => this.normalizeClient(this.unwrap(response))));
  }

  create(req: CreateClientRequest): Observable<string> {
    return this.post<unknown>('/clients', req).pipe(map(response => this.unwrap<string>(response)));
  }

  update(id: string, req: UpdateClientRequest): Observable<unknown> { return this.put(`/clients/${id}/update`, req); }
  deactivate(id: string): Observable<unknown> { return this.post(`/clients/${id}/deactivate`, {}); }
  activate(id: string): Observable<unknown> { return this.post(`/clients/${id}/activate`, {}); }
  deleteClient(id: string): Observable<unknown> { return this.delete(`/clients/${id}`); }

  private normalizeClient(source: unknown): ClientResponse {
    return {
      id: this.field<string>(source, 'id', 'clientId') ?? '',
      firstName: this.field<string>(source, 'firstName') ?? '',
      lastName: this.field<string>(source, 'lastName') ?? '',
      email: this.field<string>(source, 'email') ?? '',
      userName: this.field<string>(source, 'userName', 'username') ?? '',
      isActive: this.field<boolean>(source, 'isActive') ?? false,
      phoneNumber: this.field<string | null>(source, 'phoneNumber', 'phone') ?? null,
      address: this.field<string | null>(source, 'address') ?? null,
      notes: this.field<string | null>(source, 'notes') ?? null,
    };
  }
}
