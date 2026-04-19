import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLogResponse, AuditPagedResult, AuditLogQuery } from '../../../core/models/audit.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  result = signal<AuditPagedResult | null>(null);
  isLoading = signal(true);
  filterForm: FormGroup;

  // Audit modules matching backend constants
  modules = [
    'Auth', 'Users', 'Roles', 'Permissions',
    'Departments', 'Projects', 'Stages',
    'Checklists', 'Documents', 'Approvals',
    'Vendors', 'BOQ', 'Meetings', 'TimeTable', 'System', 'Audit'
  ];

  outcomes = ['Success', 'Failure', 'Unauthorized', 'NotFound', 'ValidationError'];

  constructor(
    private auditService: AuditService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      module: [''],
      outcome: [''],
      search: [''],
      from: [''],
      to: [''],
      page: [1],
      pageSize: [25]
    });
  }

  ngOnInit() {
    this.loadLogs();
    this.filterForm.get('module')?.valueChanges.subscribe(() => this.onFilterChange());
    this.filterForm.get('outcome')?.valueChanges.subscribe(() => this.onFilterChange());
  }

  loadLogs() {
    this.isLoading.set(true);
    const query: AuditLogQuery = {
      module: this.filterForm.get('module')?.value || undefined,
      outcome: this.filterForm.get('outcome')?.value || undefined,
      search: this.filterForm.get('search')?.value || undefined,
      from: this.filterForm.get('from')?.value || undefined,
      to: this.filterForm.get('to')?.value || undefined,
      page: this.filterForm.get('page')?.value,
      pageSize: this.filterForm.get('pageSize')?.value,
      desc: true
    };

    this.auditService.getLogs(query).subscribe({
      next: (data) => {
        this.result.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterChange() {
    this.filterForm.patchValue({ page: 1 }, { emitEvent: false });
    this.loadLogs();
  }

  onSearch() {
    this.onFilterChange();
  }

  changePage(page: number) {
    this.filterForm.patchValue({ page }, { emitEvent: false });
    this.loadLogs();
  }

  getOutcomeVariant(outcome: string): 'active' | 'inactive' | 'suspended' | 'default' {
    const map: Record<string, 'active' | 'inactive' | 'suspended' | 'default'> = {
      'Success': 'active',
      'Failure': 'suspended',
      'Unauthorized': 'suspended',
      'NotFound': 'inactive',
      'ValidationError': 'inactive'
    };
    return map[outcome] || 'default';
  }

  getActionColor(action: string): string {
    if (action.includes('Created')) return 'text-[#34a853]';
    if (action.includes('Deleted') || action.includes('Removed')) return 'text-[#ba1a1a]';
    if (action.includes('Updated') || action.includes('Moved')) return 'text-[#fbbc04]';
    if (action.includes('Login') || action.includes('Token')) return 'text-[#6cd3f7]';
    return 'text-[#515f74]';
  }

  get pages(): number[] {
    const total = this.result()?.totalPages || 1;
    return Array.from({ length: Math.min(total, 7) }, (_, i) => i + 1);
  }
}
