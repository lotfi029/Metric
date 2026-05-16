import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { HasPermissionDirective } from '../../../shared/directives';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, HasPermissionDirective],
  template: `
    <header class="page-head">
      <div><h1>Departments</h1><p>Department structure and members.</p></div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.departments.create">Create Department</button>
    </header>
    <section class="cards">
      @for (dept of departments(); track dept.id) {
        <a class="card" [routerLink]="['/departments', dept.id]">
          <strong>{{ dept.name }}</strong>
          <span>{{ dept.description || 'No description' }}</span>
          <small>Created {{ dept.createdAt | date }}</small>
        </a>
      } @empty { <p>No departments found.</p> }
    </section>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 20px; }
    h1 { margin: 0; } p { color: #64748b; margin: 6px 0 0; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
    .card { display: grid; gap: 8px; padding: 16px; color: #0f172a; text-decoration: none; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
    .card span, .card small { color: #64748b; }
  `],
})
export class DepartmentsListComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly departmentService = inject(DepartmentService);
  readonly departments = signal<DepartmentResponse[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.departments.set(await firstValueFrom(this.departmentService.getAll()).catch(() => []));
  }
}
