import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuditLogResponse } from '../../core/models';
import { AuditService } from '../../core/http/audit.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Audit Log</h1>
    <section class="table">
      @for (entry of logs(); track entry.id) {
        <div class="row">
          <strong>{{ entry.action }}</strong>
          <span>{{ entry.userName || entry.userEmail || 'System' }}</span>
          <span>{{ entry.entityName }}</span>
          <span>{{ entry.timestamp | date:'short' }}</span>
        </div>
      } @empty { <p>No audit entries found.</p> }
    </section>
  `,
  styles: [`
    h1 { margin: 0 0 18px; }
    .table { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .row { display: grid; grid-template-columns: 1fr 1fr 1fr 180px; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    span { color: #64748b; }
    @media (max-width: 760px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class AuditComponent {
  private readonly auditService = inject(AuditService);
  readonly logs = signal<AuditLogResponse[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const result = await firstValueFrom(this.auditService.getLogs({ pageSize: 25, desc: true })).catch(() => null);
    this.logs.set(result?.items ?? []);
  }
}
