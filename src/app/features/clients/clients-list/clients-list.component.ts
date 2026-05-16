import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { ClientResponse } from '../../../core/models';
import { ClientService } from '../../../core/http/client.service';
import { HasPermissionDirective } from '../../../shared/directives';
import { AddClientDialogComponent } from '../add-client-dialog/add-client-dialog.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, HasPermissionDirective],
  template: `
    <header class="page-head">
      <div><h1>Clients</h1><p>Client accounts and contact details.</p></div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.clients.create" (click)="openAdd()"><mat-icon>add</mat-icon> Add Client</button>
    </header>
    <section class="cards">
      @for (client of clients(); track client.id) {
        <article class="card">
          <strong>{{ client.firstName }} {{ client.lastName }}</strong>
          <span>{{ client.email }}</span>
          <span>{{ client.phoneNumber || 'No phone' }}</span>
          <span [class.active]="client.isActive">{{ client.isActive ? 'Active' : 'Inactive' }}</span>
        </article>
      } @empty { <p>No clients found.</p> }
    </section>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 20px; }
    h1 { margin: 0; } p { margin: 6px 0 0; color: #64748b; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
    .card { display: grid; gap: 8px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
    .card span { color: #64748b; } .active { color: #15803d !important; font-weight: 700; }
  `],
})
export class ClientsListComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly clientService = inject(ClientService);
  private readonly dialog = inject(MatDialog);
  readonly clients = signal<ClientResponse[]>([]);

  constructor() {
    void this.load();
  }

  openAdd(): void {
    this.dialog.open(AddClientDialogComponent).afterClosed().subscribe(result => {
      if (result?.success) void this.load();
    });
  }

  private async load(): Promise<void> {
    this.clients.set(await firstValueFrom(this.clientService.getAll()).catch(() => []));
  }
}
