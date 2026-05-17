import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    <header class="dialog-head">
      <span class="dialog-icon">DP</span>
      <div>
        <h2 mat-dialog-title>Create Department</h2>
        <p>Add a department that employees can be assigned to.</p>
      </div>
    </header>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <label class="field">
          <span>Department name</span>
          <input formControlName="name" autocomplete="off" placeholder="e.g. Design">
          @if (controlError('name')) {
            <small>{{ controlError('name') }}</small>
          }
        </label>
        <label class="field">
          <span>Description</span>
          <textarea rows="3" formControlName="description" placeholder="Describe the department purpose"></textarea>
          @if (controlError('description')) {
            <small>{{ controlError('description') }}</small>
          }
        </label>
      </form>
      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || isSaving()">
        <mat-spinner diameter="18" [class.is-hidden]="!isSaving()" />
        <span>{{ isSaving() ? 'Creating...' : 'Create department' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-head { display: flex; align-items: center; gap: 12px; padding: 20px 24px 4px; }
    .dialog-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #e0f5fe; color: #006e8c; font: 900 12px/1 Manrope, sans-serif; }
    h2 { margin: 0; padding: 0; color: #172033; }
    p { margin: 4px 0 0; color: #64748b; }
    mat-dialog-content { width: 100%; max-width: 100%; padding-top: 14px !important; overflow-x: hidden; }
    .form { display: grid; gap: 14px; }
    .field { display: grid; gap: 8px; color: #041627; }
    .field span { color: #344054; font-size: 13px; font-weight: 800; }
    .field input, .field textarea { width: 100%; border: 1px solid #d7dee8; border-radius: 8px; background: #fff; color: #041627; font: 600 15px/1.2 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif; outline: none; padding: 0 14px; transition: border-color .15s ease, box-shadow .15s ease; }
    .field input { height: 50px; }
    .field textarea { min-height: 94px; padding-top: 13px; resize: vertical; }
    .field input::placeholder, .field textarea::placeholder { color: #9aa4b2; font-weight: 500; }
    .field input:focus, .field textarea:focus { border-color: #0073e6; box-shadow: 0 0 0 3px rgba(0,115,230,.12); }
    .field small { color: #ba1a1a; font-size: 12px; font-weight: 700; }
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
  imports: [CommonModule, RouterLink, MatButtonModule, MatDialogModule, HasPermissionDirective],
  template: `
    <header class="hero">
      <div>
        <p class="eyebrow">Organization</p>
        <h1>Departments</h1>
        <p>Manage teams, heads, and membership movement across the organization.</p>
      </div>
      <button mat-raised-button color="primary" *appHasPermission="PERMISSIONS.departments.create" (click)="openCreate()">
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
            <span class="dept-icon">{{ dept.name.slice(0, 2).toUpperCase() }}</span>
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
          <span class="dept-icon">0</span>
          <strong>No departments found</strong>
          <span>Create your first department to start assigning employees.</span>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; color: #172033; }
    .hero { position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: clamp(22px, 4vw, 34px); margin-bottom: 16px; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: linear-gradient(135deg, rgba(2,13,24,.96), rgba(4,22,39,.92)), url("data:image/svg+xml,%3Csvg width='900' height='420' viewBox='0 0 900 420' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='900' height='420' fill='%23041627'/%3E%3Cg stroke='%236cd3f7' opacity='.16'%3E%3Cpath d='M0 90h900M0 180h900M0 270h900M0 360h900M120 0v420M240 0v420M360 0v420M480 0v420M600 0v420M720 0v420M840 0v420'/%3E%3C/g%3E%3C/svg%3E"); background-size: cover; box-shadow: 0 22px 70px rgba(4,22,39,.16); }
    .hero::after { content: ""; position: absolute; right: -130px; bottom: -170px; width: 430px; height: 430px; background: radial-gradient(circle, rgba(108,211,247,.24), transparent 62%); }
    .hero > * { position: relative; z-index: 1; }
    .eyebrow { margin: 0 0 5px; color: #6cd3f7; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    h1 { margin: 0; color: #fff; font-size: clamp(30px, 4vw, 44px); line-height: 1.04; letter-spacing: 0; } p { color: #c9d5e4; margin: 6px 0 0; }
    .hero button { min-height: 44px; border-radius: 8px; font: 900 14px/1 Manrope, sans-serif; letter-spacing: 0; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary article { display: grid; gap: 3px; padding: 14px; border: 1px solid #e1e7ef; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(4,22,39,.05); }
    .summary strong { font-size: 26px; } .summary span, .card span, .card small, .empty-state span { color: #64748b; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .card { display: grid; gap: 10px; min-height: 178px; padding: 16px; color: #172033; text-decoration: none; border: 1px solid #e1e7ef; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(4,22,39,.05); transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
    .card:hover { transform: translateY(-2px); border-color: #b9e9f8; box-shadow: 0 16px 34px rgba(4,22,39,.09); }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .dept-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #e0f5fe; color: #006e8c; font: 900 13px/1 Manrope, sans-serif; }
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
