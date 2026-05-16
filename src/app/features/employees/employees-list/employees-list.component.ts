import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { EmployeeListResponse } from '../../../core/models';
import { EmployeeService } from '../../../core/http/employee.service';
import { HasPermissionDirective } from '../../../shared/directives';
import { AddEmployeeDialogComponent } from '../add-employee-dialog/add-employee-dialog.component';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, MatIconModule, HasPermissionDirective],
  template: `
    <header class="page-head">
      <div><h1>Employees</h1><p>Manage staff, roles, departments, and permission exceptions.</p></div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.employees.create" (click)="openAdd()">
        <mat-icon>add</mat-icon> Add Employee
      </button>
    </header>
    <section class="table">
      @for (employee of employees(); track employee.id) {
        <a class="row" [routerLink]="['/employees', employee.id]">
          <span class="avatar">{{ employee.firstName[0] }}{{ employee.lastName[0] }}</span>
          <strong>{{ employee.firstName }} {{ employee.lastName }}</strong>
          <span>{{ employee.jobTitle }}</span>
          <span>{{ employee.departmentName || 'No department' }}</span>
          <span [class.active]="employee.isActive">{{ employee.isActive ? 'Active' : 'Inactive' }}</span>
        </a>
      } @empty {
        <p class="empty">No employees found.</p>
      }
    </section>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
    h1 { margin: 0; color: #0f172a; } p { margin: 6px 0 0; color: #64748b; }
    .table { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .row { display: grid; grid-template-columns: 48px 1.4fr 1fr 1fr 90px; gap: 12px; align-items: center; padding: 14px 16px; color: #334155; text-decoration: none; border-bottom: 1px solid #e2e8f0; }
    .row:hover { background: #f8fafc; } .avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-weight: 800; }
    .active { color: #15803d; font-weight: 700; } .empty { padding: 24px; }
    @media (max-width: 760px) { .page-head, .row { display: grid; grid-template-columns: 1fr; } }
  `],
})
export class EmployeesListComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  readonly employees = signal<EmployeeListResponse[]>([]);

  constructor() {
    void this.load();
  }

  openAdd(): void {
    this.dialog.open(AddEmployeeDialogComponent).afterClosed().subscribe(result => {
      if (result?.success) void this.load();
    });
  }

  private async load(): Promise<void> {
    this.employees.set(await firstValueFrom(this.employeeService.getAll()).catch(() => []));
  }
}
