import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../core/constants/permissions';
import { AuditLogResponse, ClientResponse, DepartmentResponse, EmployeeListResponse, UserListResponse } from '../../core/models';
import { AuthStore } from '../../core/auth/auth.store';
import { AuditService } from '../../core/http/audit.service';
import { ClientService } from '../../core/http/client.service';
import { DepartmentService } from '../../core/http/department.service';
import { EmployeeService } from '../../core/http/employee.service';
import { UserService } from '../../core/http/user.service';

dayjs.extend(relativeTime);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly authStore = inject(AuthStore);
  private readonly userService = inject(UserService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly auditService = inject(AuditService);
  private readonly clientService = inject(ClientService);

  readonly today = dayjs().format('dddd, MMMM D');
  readonly users = signal<UserListResponse[]>([]);
  readonly departments = signal<DepartmentResponse[]>([]);
  readonly employees = signal<EmployeeListResponse[]>([]);
  readonly audit = signal<AuditLogResponse[]>([]);
  readonly clients = signal<ClientResponse[]>([]);

  readonly showUserStats = computed(() => this.authStore.can(PERMISSIONS.users.read));
  readonly showDepartments = computed(() => this.authStore.can(PERMISSIONS.departments.read));
  readonly showEmployees = computed(() => this.authStore.can(PERMISSIONS.employees.read));
  readonly showAudit = computed(() => this.authStore.can(PERMISSIONS.audit.read));
  readonly showClients = computed(() => this.authStore.can(PERMISSIONS.clients.read));
  readonly firstName = computed(() => this.authStore.user()?.userName?.split(/[.\s_-]/)[0] ?? 'there');
  readonly activeUsers = computed(() => this.users().filter(user => user.isActive).length);
  readonly inactiveUsers = computed(() => this.users().filter(user => !user.isActive).length);
  readonly newThisMonth = computed(() => this.users().filter(user => dayjs(user.createdAt).isSame(dayjs(), 'month')).length);
  readonly recentEmployees = computed(() => [...this.employees()].sort((a, b) => a.firstName.localeCompare(b.firstName)).slice(0, 5));
  readonly activeClients = computed(() => this.clients().filter(client => client.isActive).length);

  constructor() {
    void this.loadVisibleWidgets();
  }

  fromNow(date: string): string {
    return dayjs(date).fromNow();
  }

  private async loadVisibleWidgets(): Promise<void> {
    await Promise.all([
      this.showUserStats() ? firstValueFrom(this.userService.getAll()).then(data => this.users.set(data)).catch(() => undefined) : Promise.resolve(),
      this.showDepartments() ? firstValueFrom(this.departmentService.getAll()).then(data => this.departments.set(data)).catch(() => undefined) : Promise.resolve(),
      this.showEmployees() ? firstValueFrom(this.employeeService.getAll()).then(data => this.employees.set(data)).catch(() => undefined) : Promise.resolve(),
      this.showAudit() ? firstValueFrom(this.auditService.getLogs({ pageSize: 10, desc: true })).then(data => this.audit.set(data.items)).catch(() => undefined) : Promise.resolve(),
      this.showClients() ? firstValueFrom(this.clientService.getAll()).then(data => this.clients.set(data)).catch(() => undefined) : Promise.resolve(),
    ]);
  }
}
