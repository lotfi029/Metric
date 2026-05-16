import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../../core/auth/auth.store';
import { TranslationService } from '../../../shared/layout/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="login-page">
      <section class="hero">
        <div class="grid-art"></div>
        <div class="hero-copy">
          <h1>DMS</h1>
          <p>Decoration Management System</p>
          <p class="arabic">نظام إدارة الديكور</p>
        </div>
      </section>
      <section class="form-panel">
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div>
            <h2>Welcome back</h2>
            <p>Sign in to continue</p>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
            <mat-error>Please enter a valid email.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())" aria-label="Toggle password visibility">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error>Password is required.</mat-error>
          </mat-form-field>

          <mat-checkbox>Remember me</mat-checkbox>

          <button mat-raised-button color="primary" type="submit" [disabled]="authStore.isLoading() || form.invalid">
            @if (authStore.isLoading()) {
              <mat-spinner diameter="22" />
            } @else {
              Sign In
            }
          </button>

          @if (error()) {
            <div class="error-banner">{{ error() }}</div>
          }
        </form>
      </section>
    </main>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; grid-template-columns: 60% 40%; background: #fff; }
    .hero { position: relative; overflow: hidden; display: flex; align-items: center; padding: 64px; background: #0f172a; color: #fff; }
    .grid-art { position: absolute; inset: 0; opacity: .55; background-image: radial-gradient(circle at center, #38bdf8 0 2px, transparent 3px), linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px); background-size: 72px 72px, 72px 72px, 72px 72px; filter: drop-shadow(0 0 10px #38bdf8); }
    .hero-copy { position: relative; z-index: 1; }
    h1 { margin: 0; font-size: 72px; line-height: 1; letter-spacing: -2px; font-weight: 800; }
    .hero p { margin: 12px 0 0; color: #94a3b8; font-size: 14px; }
    .hero .arabic { color: #64748b; font-family: 'IBM Plex Sans Arabic', sans-serif; }
    .form-panel { display: grid; place-items: center; padding: 40px; }
    .login-form { width: min(100%, 420px); display: grid; gap: 18px; }
    h2 { margin: 0 0 6px; color: #0f172a; font-size: 32px; }
    .login-form p { margin: 0; color: #64748b; }
    mat-form-field, button[type="submit"] { width: 100%; }
    button[type="submit"] { height: 48px; }
    mat-spinner { margin: 0 auto; }
    .error-banner { padding: 12px 14px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-weight: 600; }
    @media (max-width: 860px) { .login-page { grid-template-columns: 1fr; } .hero { min-height: 260px; padding: 36px; } }
  `],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly translation = inject(TranslationService);
  readonly showPassword = signal(false);
  readonly error = computed(() => this.authStore.error() ? (this.translation.isRtl() ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : this.authStore.error()) : null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.authStore.initFromStorage();
    if (this.authStore.user()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.authStore.login(this.form.getRawValue());
    if (this.authStore.user()) {
      this.authStore.startPermissionPolling();
      await this.router.navigate(['/dashboard']);
    }
  }
}
