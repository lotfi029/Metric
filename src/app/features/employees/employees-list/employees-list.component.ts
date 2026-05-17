import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { EmployeeListResponse } from '../../../core/models';
import { EmployeeService } from '../../../core/http/employee.service';
import { HasPermissionDirective } from '../../../shared/directives';
import { AddEmployeeDialogComponent } from '../add-employee-dialog/add-employee-dialog.component';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, HasPermissionDirective],
  template: `
    <header class="page-head">
      <div>
        <p class="eyebrow">People</p>
        <h1>Employees</h1>
        <p>Manage staff, roles, departments, and permission exceptions.</p>
      </div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.employees.create" (click)="openAdd()">
        Add Employee
      </button>
    </header>

    <section class="summary">
      <article><strong>{{ employees().length }}</strong><span>Total employees</span></article>
      <article><strong>{{ activeCount() }}</strong><span>Active</span></article>
      <article><strong>{{ withoutDepartmentCount() }}</strong><span>Needs department</span></article>
    </section>

    <section class="table">
      <div class="row table-head">
        <span></span>
        <span>Name</span>
        <span>Job title</span>
        <span>Department</span>
        <span>Status</span>
      </div>
      @for (employee of employees(); track employee.id) {
        <a class="row" [routerLink]="['/employees', employee.id]">
          <span class="avatar">{{ initials(employee) }}</span>
          <strong>{{ employee.firstName }} {{ employee.lastName }}</strong>
          <span>{{ employee.jobTitle || 'No title' }}</span>
          <span>{{ employee.departmentName || 'No department' }}</span>
          <span class="status" [class.off]="!employee.isActive">{{ employee.isActive ? 'Active' : 'Inactive' }}</span>
        </a>
      } @empty {
        <div class="empty-state">
          <span class="empty-mark">0</span>
          <strong>No employees found</strong>
          <span>Add an employee to start building the staff directory.</span>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; color: #172033; }
    .page-head { position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: clamp(22px, 4vw, 34px); margin-bottom: 16px; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: linear-gradient(135deg, rgba(2,13,24,.96), rgba(4,22,39,.92)), url("data:image/svg+xml,%3Csvg width='900' height='420' viewBox='0 0 900 420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='900' height='420' fill='%23041627'/%3E%3Cg stroke='%236cd3f7' opacity='.16'%3E%3Cpath d='M0 90h900M0 180h900M0 270h900M0 360h900M120 0v420M240 0v420M360 0v420M480 0v420M600 0v420M720 0v420M840 0v420'/%3E%3C/g%3E%3C/svg%3E"); background-size: cover; box-shadow: 0 22px 70px rgba(4,22,39,.16); }
    .page-head::after { content: ""; position: absolute; right: -130px; bottom: -170px; width: 430px; height: 430px; background: radial-gradient(circle, rgba(108,211,247,.24), transparent 62%); }
    .page-head > * { position: relative; z-index: 1; }
    .eyebrow { margin: 0 0 5px; color: #6cd3f7; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    h1 { margin: 0; color: #fff; font-size: clamp(30px, 4vw, 44px); line-height: 1.04; letter-spacing: 0; }
    p { margin: 6px 0 0; color: #c9d5e4; }
    .page-head button { min-height: 44px; border-radius: 8px; font: 900 14px/1 Manrope, sans-serif; letter-spacing: 0; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary article { display: grid; gap: 3px; padding: 14px; border: 1px solid #e1e7ef; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(4,22,39,.05); }
    .summary strong { color: #172033; font-size: 26px; }
    .summary span { color: #64748b; }
    .table { background: #fff; border: 1px solid #e1e7ef; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 24px rgba(4,22,39,.05); }
    .row { display: grid; grid-template-columns: 48px 1.4fr 1fr 1fr 96px; gap: 12px; align-items: center; padding: 14px 16px; color: #334155; text-decoration: none; border-bottom: 1px solid #eef2f7; }
    .row:last-child { border-bottom: 0; }
    .row:hover { background: #f8fafc; }
    .table-head { background: #f8fafc; color: #64748b; font: 800 12px/1.2 Manrope, sans-serif; text-transform: uppercase; }
    .avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px; background: #e0f5fe; color: #006e8c; font-weight: 900; }
    .status { width: fit-content; padding: 5px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 800; font-size: 12px; }
    .status.off { background: #fee2e2; color: #991b1b; }
    .empty-state { display: grid; place-items: center; gap: 8px; padding: 44px 16px; color: #64748b; text-align: center; }
    .empty-state strong { color: #172033; }
    .empty-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #eef2f7; color: #64748b; font-size: 12px; font-weight: 900; }
    @media (max-width: 760px) { .page-head, .summary, .row { display: grid; grid-template-columns: 1fr; } }
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

  initials(employee: EmployeeListResponse): string {
    return `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase() || 'E';
  }

  activeCount(): number {
    return this.employees().filter(employee => employee.isActive).length;
  }

  withoutDepartmentCount(): number {
    return this.employees().filter(employee => !employee.departmentName).length;
  }

  openAdd(): void {
    this.dialog.open(AddEmployeeDialogComponent, {
      autoFocus: false,
      width: 'min(1080px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
    }).afterClosed().subscribe(result => {
      if (result?.success) void this.load();
    });
  }

  private async load(): Promise<void> {
    this.employees.set(await firstValueFrom(this.employeeService.getAll()).catch(() => []));
  }
}
