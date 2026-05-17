import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { DepartmentResponse } from '../../../core/models';
import { DepartmentService } from '../../../core/http/department.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';
import { HasPermissionDirective } from '../../../shared/directives';

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <header class="dialog-head">
      <span class="dialog-icon"><mat-icon>add_business</mat-icon></span>
      <div>
        <h2 mat-dialog-title>Create Department</h2>
        <p>Add a department that employees can be assigned to.</p>
      </div>
    </header>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Department name</mat-label>
          <input matInput formControlName="name" autocomplete="off" placeholder="e.g. Design">
          <mat-error>{{ controlError('name') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description" placeholder="Describe the department purpose"></textarea>
          <mat-error>{{ controlError('description') }}</mat-error>
        </mat-form-field>
      </form>
      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || isSaving()">
        <mat-spinner diameter="18" [class.is-hidden]="!isSaving()" />
        <mat-icon [class.is-hidden]="isSaving()">add</mat-icon>
        <span>{{ isSaving() ? 'Creating...' : 'Create department' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-head { display: flex; align-items: center; gap: 12px; padding: 20px 24px 4px; }
    .dialog-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #dbeafe; color: #1d4ed8; }
    h2 { margin: 0; padding: 0; color: #172033; }
    p { margin: 4px 0 0; color: #64748b; }
    mat-dialog-content { width: 100%; max-width: 100%; padding-top: 14px !important; overflow-x: hidden; }
    .form { display: grid; gap: 14px; }
    mat-form-field { width: 100%; }
    .error { margin: 0; padding: 10px 12px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-weight: 700; }
    mat-dialog-actions button { min-height: 40px; }
    mat-spinner { display: inline-block; margin-right: 8px; }
    .is-hidden { display: none !important; }
  `],
})
export class DepartmentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DepartmentService);
  private readonly dialogRef = inject(MatDialogRef<DepartmentFormDialogComponent>);
  private readonly errors = inject(ErrorHandlerService);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.isSaving.set(true);
      this.errorMessage.set('');
      const raw = this.form.getRawValue();
      await firstValueFrom(this.service.create({
        name: raw.name.trim(),
        description: raw.description.trim() || undefined,
      }));
      this.dialogRef.close(true);
    } catch (error: any) {
      const parsed = this.errors.parseHttpError(error);
      this.errorMessage.set(parsed.generalMessage);
      this.errors.applyToForm(this.form, parsed.fieldErrors);
    } finally {
      this.isSaving.set(false);
    }
  }

  controlError(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('serverError')) return control.getError('serverError');
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'This field is too long.';
    return '';
  }
}

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, MatIconModule, HasPermissionDirective],
  template: `
    <header class="hero">
      <div>
        <h1>Departments</h1>
        <p>Manage teams, heads, and membership movement across the organization.</p>
      </div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.departments.create" (click)="openCreate()">
        <mat-icon>add_business</mat-icon>
        Create Department
      </button>
    </header>

    <section class="summary">
      <article><strong>{{ departments().length }}</strong><span>Total departments</span></article>
      <article><strong>{{ headedCount() }}</strong><span>With department head</span></article>
      <article><strong>{{ departments().length - headedCount() }}</strong><span>Needs head</span></article>
    </section>

    <section class="cards">
      @for (dept of departments(); track dept.id) {
        <a class="card" [routerLink]="['/departments', dept.id]">
          <div class="card-top">
            <span class="dept-icon"><mat-icon>corporate_fare</mat-icon></span>
            @if (dept.departmentHead || dept.departmentHeadId) {
              <span class="badge ok">Head assigned</span>
            } @else {
              <span class="badge warn">No head</span>
            }
          </div>
          <strong>{{ dept.name }}</strong>
          <span>{{ dept.description || 'No description has been added.' }}</span>
          <small>Created {{ dept.createdAt | date:'mediumDate' }}</small>
        </a>
      } @empty {
        <div class="empty-state">
          <mat-icon>domain_disabled</mat-icon>
          <strong>No departments found</strong>
          <span>Create your first department to start assigning employees.</span>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; color: #172033; }
    .hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: 22px; margin-bottom: 16px; border: 1px solid #dbe5ef; border-radius: 8px; background: linear-gradient(135deg, #fff 0%, #f4f8fb 100%); }
    h1 { margin: 0; font-size: 30px; letter-spacing: 0; } p { color: #64748b; margin: 6px 0 0; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary article { display: grid; gap: 3px; padding: 14px; border: 1px solid #dbe5ef; border-radius: 8px; background: #fff; }
    .summary strong { font-size: 26px; } .summary span, .card span, .card small, .empty-state span { color: #64748b; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .card { display: grid; gap: 10px; padding: 16px; color: #172033; text-decoration: none; border: 1px solid #dbe5ef; border-radius: 8px; background: #fff; box-shadow: 0 10px 30px rgba(15, 23, 42, .04); transition: transform .15s ease, box-shadow .15s ease; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(15, 23, 42, .08); }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .dept-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 8px; background: #dbeafe; color: #1d4ed8; }
    .badge { padding: 5px 9px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .badge.ok { background: #dcfce7; color: #166534; } .badge.warn { background: #fef3c7; color: #92400e; }
    .empty-state { grid-column: 1 / -1; display: grid; place-items: center; gap: 8px; padding: 44px 16px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #fff; text-align: center; }
    @media (max-width: 760px) { .hero, .summary { grid-template-columns: 1fr; display: grid; } }
  `],
})
export class DepartmentsListComponent {
  readonly PERMISSIONS = PERMISSIONS;
  private readonly departmentService = inject(DepartmentService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly departments = signal<DepartmentResponse[]>([]);

  constructor() {
    void this.load();
  }

  headedCount(): number {
    return this.departments().filter(dept => !!(dept.departmentHead || dept.departmentHeadId)).length;
  }

  openCreate(): void {
    this.dialog.open(DepartmentFormDialogComponent, {
      autoFocus: false,
      width: 'min(620px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Department created.', 'Dismiss', { duration: 2500 });
        void this.load();
      }
    });
  }

  private async load(): Promise<void> {
    this.departments.set(await firstValueFrom(this.departmentService.getAll()).catch(() => []));
  }
}
