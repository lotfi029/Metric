import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { ClientResponse } from '../../../core/models';
import { ClientService } from '../../../core/http/client.service';
import { HasPermissionDirective } from '../../../shared/directives';
import { AddClientDialogComponent } from '../add-client-dialog/add-client-dialog.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HasPermissionDirective,
  ],
  template: `
    <header class="hero">
      <div>
        <h1>Clients</h1>
        <p>Client accounts, contact details, and account status.</p>
      </div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.clients.create" (click)="openAdd()">
        <mat-icon>add</mat-icon>
        Add Client
      </button>
    </header>

    <section class="toolbar">
      <mat-form-field appearance="outline">
        <mat-label>Search clients</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchControl" placeholder="Name, email, username, phone">
      </mat-form-field>
      <div class="stats">
        <span><strong>{{ clients().length }}</strong>Total</span>
        <span><strong>{{ activeCount() }}</strong>Active</span>
        <span><strong>{{ inactiveCount() }}</strong>Inactive</span>
      </div>
    </section>

    @if (isLoading()) {
      <div class="loading"><mat-spinner diameter="36" /> Loading clients</div>
    } @else {
      <div class="workspace">
        <section class="client-list" aria-label="Clients">
          @for (client of filteredClients(); track client.id) {
            <button class="client-row" [class.selected]="selectedClient()?.id === client.id" (click)="select(client)">
              <span class="avatar">{{ initials(client) }}</span>
              <span class="identity">
                <strong>{{ displayName(client) }}</strong>
                <small>{{ client.email || client.userName || 'No email' }}</small>
              </span>
              <span class="status" [class.off]="!client.isActive">{{ client.isActive ? 'Active' : 'Inactive' }}</span>
            </button>
          } @empty {
            <div class="empty-state">
              <mat-icon>person_search</mat-icon>
              <strong>No clients found</strong>
              <span>Try a different search or add a new client.</span>
            </div>
          }
        </section>

        <aside class="detail">
          @if (selectedClient(); as client) {
            <div class="detail-head">
              <span class="avatar large">{{ initials(client) }}</span>
              <div>
                <h2>{{ displayName(client) }}</h2>
                <p>{{ client.userName || 'No username' }}</p>
              </div>
            </div>

            <dl class="info-grid">
              <div><dt>Email</dt><dd>{{ client.email || 'Not set' }}</dd></div>
              <div><dt>Phone</dt><dd>{{ client.phoneNumber || 'Not set' }}</dd></div>
              <div><dt>Address</dt><dd>{{ client.address || 'Not set' }}</dd></div>
              <div><dt>Status</dt><dd><span class="status" [class.off]="!client.isActive">{{ client.isActive ? 'Active' : 'Inactive' }}</span></dd></div>
              <div class="wide"><dt>Notes</dt><dd>{{ client.notes || 'No notes' }}</dd></div>
            </dl>

            <div class="actions">
              <button mat-stroked-button *appHasPermission="PERMISSIONS.clients.update" (click)="openEdit(client)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-stroked-button *appHasPermission="PERMISSIONS.clients.deactivate" [disabled]="isSaving()" (click)="toggleStatus(client)">
                <mat-icon>{{ client.isActive ? 'block' : 'check_circle' }}</mat-icon>
                {{ client.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button mat-stroked-button color="warn" *appHasPermission="PERMISSIONS.clients.delete" [disabled]="isSaving()" (click)="deleteClient(client)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </div>
          } @else {
            <div class="empty-state tall">
              <mat-icon>contacts</mat-icon>
              <strong>Select a client</strong>
              <span>Client details and actions will appear here.</span>
            </div>
          }
        </aside>
      </div>
    }
  `,
  styles: [`
    :host { display: block; color: #172033; }
    .hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: 22px; margin-bottom: 16px; border: 1px solid #dbe5ef; border-radius: 8px; background: linear-gradient(135deg, #fff 0%, #f4f8fb 100%); }
    h1, h2 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 30px; } p { margin: 6px 0 0; color: #64748b; }
    .toolbar { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 16px; }
    .toolbar mat-form-field { width: min(460px, 100%); }
    .stats { display: flex; gap: 10px; }
    .stats span { min-width: 92px; display: grid; gap: 2px; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #64748b; font-size: 12px; }
    .stats strong { color: #172033; font-size: 20px; }
    .workspace { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 18px; align-items: start; }
    .client-list, .detail { background: #fff; border: 1px solid #dbe5ef; border-radius: 8px; box-shadow: 0 10px 30px rgba(15, 23, 42, .04); overflow: hidden; }
    .client-row { width: 100%; display: grid; grid-template-columns: 44px 1fr auto; gap: 12px; align-items: center; padding: 14px; border: 0; border-bottom: 1px solid #eef2f7; background: #fff; color: inherit; text-align: left; cursor: pointer; }
    .client-row:hover, .client-row.selected { background: #f8fafc; }
    .client-row.selected { box-shadow: inset 3px 0 #2563eb; }
    .avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-weight: 800; }
    .avatar.large { width: 64px; height: 64px; font-size: 20px; }
    .identity { min-width: 0; } .identity strong, .identity small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    small, dt, .empty-state span { color: #64748b; }
    .status { width: fit-content; padding: 5px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; font-size: 12px; }
    .status.off { background: #fee2e2; color: #991b1b; }
    .detail { padding: 18px; }
    .detail-head { display: flex; gap: 14px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #eef2f7; }
    .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
    .info-grid div { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
    .info-grid .wide { grid-column: 1 / -1; }
    dt { font-size: 12px; font-weight: 800; text-transform: uppercase; } dd { margin: 5px 0 0; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .empty-state, .loading { display: grid; place-items: center; gap: 8px; padding: 44px 16px; color: #64748b; text-align: center; }
    .empty-state.tall { min-height: 360px; }
    .empty-state mat-icon { color: #94a3b8; }
    @media (max-width: 960px) { .hero, .toolbar, .workspace { display: grid; grid-template-columns: 1fr; } .stats { flex-wrap: wrap; } }
    @media (max-width: 620px) { .client-row, .info-grid { grid-template-columns: 1fr; } }
  `],
})
export class ClientsListComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly clientService = inject(ClientService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly clients = signal<ClientResponse[]>([]);
  readonly selectedClient = signal<ClientResponse | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly searchTerm = signal('');

  readonly filteredClients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.clients();
    return this.clients().filter(client =>
      `${client.firstName} ${client.lastName} ${client.email} ${client.userName} ${client.phoneNumber ?? ''}`.toLowerCase().includes(term),
    );
  });
  readonly activeCount = computed(() => this.clients().filter(client => client.isActive).length);
  readonly inactiveCount = computed(() => this.clients().filter(client => !client.isActive).length);

  constructor() {
    this.searchControl.valueChanges.subscribe(value => this.searchTerm.set(value));
    void this.load();
  }

  select(client: ClientResponse): void {
    this.selectedClient.set(client);
  }

  initials(client: ClientResponse): string {
    return `${client.firstName?.[0] ?? ''}${client.lastName?.[0] ?? ''}`.toUpperCase() || 'C';
  }

  displayName(client: ClientResponse): string {
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.userName || client.email || 'Unnamed client';
  }

  openAdd(): void {
    this.dialog.open(AddClientDialogComponent, {
      autoFocus: false,
      width: 'min(820px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
    }).afterClosed().subscribe(result => {
      if (result?.success) void this.load(false, result.clientId);
    });
  }

  openEdit(client: ClientResponse): void {
    this.dialog.open(AddClientDialogComponent, {
      autoFocus: false,
      width: 'min(820px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      data: { client },
    }).afterClosed().subscribe(result => {
      if (result?.success) void this.load(false, client.id);
    });
  }

  async toggleStatus(client: ClientResponse): Promise<void> {
    await this.runMutation(
      () => client.isActive ? this.clientService.deactivate(client.id) : this.clientService.activate(client.id),
      client.isActive ? 'Client deactivated.' : 'Client activated.',
      client.id,
    );
  }

  async deleteClient(client: ClientResponse): Promise<void> {
    const confirmed = window.confirm(`Delete ${this.displayName(client)}?`);
    if (!confirmed) return;
    await this.runMutation(() => this.clientService.deleteClient(client.id), 'Client deleted.', null);
  }

  private async runMutation(request: () => ReturnType<ClientService['deactivate']>, success: string, selectId: string | null): Promise<void> {
    this.isSaving.set(true);
    try {
      await firstValueFrom(request());
      this.snackBar.open(success, 'Dismiss', { duration: 2500 });
      await this.load(false, selectId ?? undefined);
    } catch (error: any) {
      this.snackBar.open(error?.error?.title || 'Client update failed.', 'Dismiss', { duration: 4000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  private async load(showSpinner = true, selectId?: string): Promise<void> {
    if (showSpinner) this.isLoading.set(true);
    const clients = await firstValueFrom(this.clientService.getAll()).catch(() => []);
    this.clients.set(clients);
    const currentId = selectId ?? this.selectedClient()?.id;
    this.selectedClient.set(clients.find(client => client.id === currentId) ?? clients[0] ?? null);
    this.isLoading.set(false);
  }
}
