import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse, EmployeeListResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { HasPermissionDirective } from '../../../shared/directives';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, HasPermissionDirective],
  template: `
    @if (department(); as dept) {
      <div class="layout">
        <aside class="card">
          <h1>{{ dept.name }}</h1>
          <p>{{ dept.description || 'No description' }}</p>
          <section class="head">
            <h2>Department Head</h2>
            @if (dept.departmentHead) {
              <strong>{{ dept.departmentHead.firstName }} {{ dept.departmentHead.lastName }}</strong>
              <span>{{ dept.departmentHead.jobTitle }}</span>
              <button mat-button *appHasPermission="PERMISSIONS.departments.assignHead">Remove Head</button>
            } @else {
              <span class="warning">No Department Head</span>
              <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.departments.assignHead">Assign Head</button>
            }
          </section>
          <small>Created {{ dept.createdAt | date }}</small>
          <button mat-button color="warn" *appHasPermission="PERMISSIONS.departments.delete">Delete Department</button>
        </aside>
        <section class="card">
          <header class="members-head">
            <h2>Members</h2>
            <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.departments.assignToUser">Add Employee</button>
          </header>
          @for (member of members(); track member.id) {
            <div class="member-row">
              <span class="avatar">{{ member.firstName[0] }}{{ member.lastName[0] }}</span>
              <strong>{{ member.firstName }} {{ member.lastName }}</strong>
              <span>{{ member.jobTitle }}</span>
              <span>{{ member.isActive ? 'Active' : 'Inactive' }}</span>
              <button mat-button *appHasPermission="PERMISSIONS.departments.removeFromUser">Remove</button>
              <button mat-button *appHasPermission="PERMISSIONS.departments.moveUser">Move</button>
            </div>
          } @empty {
            <p>This department has no members yet. Add employees to get started.</p>
          }
        </section>
      </div>
    }
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    h1, h2 { margin: 0 0 10px; } p, span, small { color: #64748b; }
    .head { display: grid; gap: 8px; margin: 18px 0; } .warning { display: inline-block; color: #92400e; font-weight: 800; }
    .members-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 14px; }
    .member-row { display: grid; grid-template-columns: 44px 1.2fr 1fr .7fr auto auto; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-weight: 800; }
    @media (max-width: 900px) { .layout, .member-row { grid-template-columns: 1fr; } }
  `],
})
export class DepartmentDetailComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);
  readonly department = signal<DepartmentResponse | null>(null);
  readonly members = signal<EmployeeListResponse[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const [dept, members] = await Promise.all([
      firstValueFrom(this.departmentService.getById(id)).catch(() => null),
      firstValueFrom(this.departmentService.getMembers(id)).catch(() => []),
    ]);
    this.department.set(dept);
    this.members.set(members);
  }
}
