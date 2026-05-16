import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { ClientService } from '../../../core/http/client.service';
import { ErrorHandlerService } from '../../../core/http/error-handler.service';

@Component({
  selector: 'app-add-client-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Add Client</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline"><mat-label>First name</mat-label><input matInput formControlName="firstName"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Last name</mat-label><input matInput formControlName="lastName"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Username</mat-label><input matInput formControlName="userName"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" formControlName="password"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
        <mat-form-field appearance="outline" class="wide"><mat-label>Address</mat-label><input matInput formControlName="address"></mat-form-field>
        <mat-form-field appearance="outline" class="wide"><mat-label>Notes</mat-label><textarea matInput rows="3" formControlName="notes"></textarea></mat-form-field>
      </form>
      @if (errorMessage) { <p class="error">{{ errorMessage }}</p> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { width: min(720px, 84vw); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding-top: 8px; }
    .wide { grid-column: 1 / -1; } .error { color: #b91c1c; font-weight: 700; }
    @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class AddClientDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly dialogRef = inject(MatDialogRef<AddClientDialogComponent>);
  private readonly errors = inject(ErrorHandlerService);
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    userName: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const clientId = await firstValueFrom(this.clientService.create(this.form.getRawValue()));
      this.dialogRef.close({ success: true, clientId });
    } catch (error: any) {
      const parsed = this.errors.parse(error);
      this.errorMessage = parsed.generalMessage;
      this.errors.applyToForm(this.form, parsed.fieldErrors);
    }
  }
}
