import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientResponse, CreateClientRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ClientService extends ApiService {
  getAll(): Observable<ClientResponse[]> { return this.get('/clients'); }
  getById(id: string): Observable<ClientResponse> { return this.get(`/clients/${id}`); }
  create(req: CreateClientRequest): Observable<string> { return this.post('/clients', req); }
}
