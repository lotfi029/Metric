import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { MOCK_CLIENTS, Client } from '@core/mock/index';

@Component({
  selector: 'app-client-directory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent],
  templateUrl: './client-directory.component.html',
  styleUrls: ['./client-directory.component.css']
})
export class ClientDirectoryComponent implements OnInit {
  allClients = signal<Client[]>(MOCK_CLIENTS);
  selectedClient = signal<Client | null>(null);
  searchControl = new FormControl('', { nonNullable: true });
  statusControl = new FormControl('', { nonNullable: true });
  typeControl = new FormControl('', { nonNullable: true });
  private _search = signal('');
  private _status = signal('');
  private _type = signal('');

  statuses = ['Active', 'VIP', 'Prospect', 'Inactive'];
  types = ['Individual', 'Corporate', 'Government'];

  filteredClients = computed(() => {
    let c = this.allClients();
    if (this._search()) {
      const q = this._search().toLowerCase();
      c = c.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        x.city.toLowerCase().includes(q)
      );
    }
    if (this._status()) c = c.filter(x => x.status === this._status());
    if (this._type()) c = c.filter(x => x.type === this._type());
    return c;
  });

  ngOnInit() {
    this.selectedClient.set(MOCK_CLIENTS[0]);
    this.searchControl.valueChanges.subscribe(value => this._search.set(value));
    this.statusControl.valueChanges.subscribe(value => this._status.set(value));
    this.typeControl.valueChanges.subscribe(value => this._type.set(value));
  }

  selectClient(c: Client) { this.selectedClient.set(c); }

  getStatusVariant(s: string): 'active' | 'inactive' | 'suspended' | 'default' {
    const m: Record<string, 'active' | 'inactive' | 'suspended' | 'default'> = {
      'Active': 'active', 'VIP': 'active',
      'Inactive': 'inactive', 'Prospect': 'default'
    };
    return m[s] || 'default';
  }

  getBudgetColor(b: string): string {
    const m: Record<string, string> = {
      'Luxury': '#6cd3f7', 'Premium': '#34a853',
      'Mid-Range': '#fbbc04', 'Economy': '#8192a7'
    };
    return m[b] || '#8192a7';
  }

  get vipCount() { return this.allClients().filter(c => c.status === 'VIP').length; }
  get totalSpent() { return this.allClients().reduce((a, c) => a + c.totalSpent, 0); }
}
