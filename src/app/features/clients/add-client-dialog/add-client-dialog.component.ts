import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ClientResponse } from '../../../core/models';
import { ClientService } from '../../../core/http/client.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';

export type ClientDialogData = { client?: ClientResponse };

@Component({
  selector: 'app-add-client-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-head">
      <div class="form-mark">{{ isEdit ? 'ED' : 'CL' }}</div>
      <div>
        <h2 mat-dialog-title>{{ isEdit ? 'Edit Client' : 'Add Client' }}</h2>
        <p>{{ isEdit ? 'Update contact and account profile details.' : 'Create a client account with contact details.' }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" autocomplete="given-name">
          <mat-error>{{ controlError('firstName') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" autocomplete="family-name">
          <mat-error>{{ controlError('lastName') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" [readonly]="isEdit" autocomplete="email">
          <mat-error>{{ controlError('email') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="userName" [readonly]="isEdit" autocomplete="username">
          <mat-error>{{ controlError('userName') }}</mat-error>
        </mat-form-field>
        @if (!isEdit) {
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password">
            <mat-hint>Use at least 6 characters.</mat-hint>
            <mat-error>{{ controlError('password') }}</mat-error>
          </mat-form-field>
        }
        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" autocomplete="tel">
          <mat-error>{{ controlError('phone') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="wide">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address">
          <mat-error>{{ controlError('address') }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="wide">
          <mat-label>Notes</mat-label>
          <textarea matInput rows="3" formControlName="notes"></textarea>
          <mat-error>{{ controlError('notes') }}</mat-error>
        </mat-form-field>
      </form>
      @if (errorMessage) {
        <p class="error">{{ errorMessage }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving">Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="isSaving">
        @if (isSaving) { <mat-spinner diameter="20" /> } @else { {{ isEdit ? 'Save Changes' : 'Create Client' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-head { display: flex; gap: 12px; align-items: center; padding: 22px 24px 10px; border-bottom: 1px solid #e2e8f0; }
    .form-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 8px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 900; }
    h2 { margin: 0; padding: 0; color: #172033; }
    p { margin: 4px 0 0; color: #64748b; }
    mat-dialog-content { width: 100%; max-width: 100%; padding-top: 18px !important; overflow-x: hidden; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap: 16px; padding: 14px; border-radius: 8px; background: #f8fafc; }
    mat-form-field { width: 100%; }
    :host ::ng-deep .mat-mdc-form-field input.mat-mdc-input-element,
    :host ::ng-deep .mat-mdc-form-field textarea.mat-mdc-input-element {
      color: #041627;
      font: 500 16px/1.45 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif;
      letter-spacing: 0;
    }
    :host ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label {
      color: #344054;
      font-weight: 800;
      letter-spacing: 0;
    }
    .wide { grid-column: 1 / -1; }
    .error { padding: 10px 12px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-weight: 700; }
    mat-spinner { display: inline-block; margin: 0 12px; }
    mat-dialog-actions { padding: 12px 24px 20px; }
    mat-dialog-actions button { min-height: 40px; }
    @media (max-width: 680px) { .dialog-head { align-items: flex-start; } .grid { grid-template-columns: minmax(0, 1fr); } }
  `],
})
export class AddClientDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly dialogRef = inject(MatDialogRef<AddClientDialogComponent>);
  private readonly errors = inject(ErrorHandlerService);
  readonly isEdit: boolean;
  errorMessage = '';
  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    userName: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ClientDialogData | null) {
    const client = data?.client;
    this.isEdit = !!client;
    if (client) {
      this.form.patchValue({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        userName: client.userName,
        phone: client.phoneNumber ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
      });
      this.form.controls.password.clearValidators();
      this.form.controls.email.disable();
      this.form.controls.userName.disable();
    } else {
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    try {
      const raw = this.form.getRawValue();
      if (this.isEdit && this.data?.client) {
        await firstValueFrom(this.clientService.update(this.data.client.id, {
          firstName: raw.firstName,
          lastName: raw.lastName,
          phone: raw.phone,
          address: raw.address,
          notes: raw.notes,
        }));
        this.dialogRef.close({ success: true, clientId: this.data.client.id });
      } else {
        const clientId = await firstValueFrom(this.clientService.create(raw));
        this.dialogRef.close({ success: true, clientId });
      }
    } catch (error: any) {
      const parsed = this.errors.parse(error);
      this.errorMessage = parsed.generalMessage;
      this.errors.applyToForm(this.form, parsed.fieldErrors);
    } finally {
      this.isSaving = false;
    }
  }

  controlError(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (control.hasError('serverError')) return control.getError('serverError');
    if (control.hasError('required')) return 'Required';
    if (control.hasError('email')) return 'Enter a valid email';
    if (control.hasError('maxlength')) return 'Too long';
    if (control.hasError('minlength')) return 'Too short';
    return '';
  }
}
