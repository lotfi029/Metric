import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '@core/services/toast.service';
import { MOCK_EMPLOYEES, MOCK_DEPARTMENTS, Employee } from '@core/mock/index';

@Component({
  selector: 'app-user-directory',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BadgeComponent, ConfirmDialogComponent],
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.css']
})
export class UserDirectoryComponent implements OnInit {
  allEmployees  = signal<Employee[]>(MOCK_EMPLOYEES);
  searchControl = new FormControl('', { nonNullable: true });
  deptControl = new FormControl('', { nonNullable: true });
  roleControl = new FormControl('', { nonNullable: true });
  private _search = signal('');
  private _dept = signal('');
  private _role = signal('');
  viewMode      = signal<'grid' | 'list'>('grid');
  showDelete    = signal(false);
  toDelete: Employee | null = null;

  departments = MOCK_DEPARTMENTS;

  filteredEmployees = computed(() => {
    let e = this.allEmployees();
    if (this._search()) {
      const q = this._search().toLowerCase();
      e = e.filter(x =>
        `${x.firstName} ${x.lastName}`.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        x.title.toLowerCase().includes(q)
      );
    }
    if (this._dept()) e = e.filter(x => x.departmentId === this._dept());
    if (this._role()) e = e.filter(x => x.roleLevel === this._role());
    return e;
  });

  roleLevels = ['manager', 'senior', 'mid', 'junior'];

  constructor(private toastService: ToastService) {}
  ngOnInit() {
    this.searchControl.valueChanges.subscribe(value => this._search.set(value));
    this.deptControl.valueChanges.subscribe(value => this._dept.set(value));
    this.roleControl.valueChanges.subscribe(value => this._role.set(value));
  }

  getDeptColor(deptId: string): string {
    const d = this.departments.find(x => x.id === deptId);
    return d?.color || '#8192a7';
  }

  getDeptName(deptId: string): string {
    return this.departments.find(x => x.id === deptId)?.name || 'Unknown';
  }

  getRoleBadgeClass(level: string): string {
    const m: Record<string, string> = {
      'manager': 'bg-[#041627] text-white',
      'senior': 'bg-[#1a2b3c] text-[#6cd3f7]',
      'mid': 'bg-[#f2f4f6] text-[#515f74]',
      'junior': 'bg-[#f2f4f6] text-[#8192a7]'
    };
    return m[level] || 'bg-[#f2f4f6] text-[#8192a7]';
  }

  get activeCount() { return this.allEmployees().filter(e => e.isActive).length; }

  confirmDelete(emp: Employee) { 
    this.toDelete = emp; 
    this.showDelete.set(true); 
  }

  doDelete() {
    if (!this.toDelete) return;
    this.toastService.showSuccess(`${this.toDelete.firstName} deactivated`);
    this.showDelete.set(false);
  }
}
