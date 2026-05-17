import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../../core/auth/auth.store';
import { TranslationService } from '../../../shared/layout/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="login-page">
      <section class="brand-panel" aria-label="DMS overview">
        <div class="brand-content">
          <div class="brand-badge" aria-hidden="true">DMS</div>
          <div>
            <p class="eyebrow">Decoration Management System</p>
            <h1>One workspace for interior operations.</h1>
            <p class="hero-copy">Track departments, employees, permissions, projects, approvals, and budgets from a focused DMS control room.</p>
          </div>

          <div class="dashboard-preview" aria-hidden="true">
            <div class="preview-top">
              <span>Project health</span>
              <strong>92%</strong>
            </div>
            <div class="progress-row"><span style="width: 92%"></span></div>
            <div class="preview-grid">
              <div><small>Departments</small><strong>8</strong></div>
              <div><small>Open tasks</small><strong>36</strong></div>
              <div><small>Approvals</small><strong>14</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-card">
          <div class="form-brand" aria-hidden="true">DMS</div>
          <div class="form-heading">
            <h2>Welcome back</h2>
            <p>Sign in to your DMS workspace.</p>
          </div>

          @if (error()) {
            <div class="error-banner">{{ error() }}</div>
          }

          <label class="field">
            <span>Email</span>
            <input
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="name@company.com"
              [class.invalid]="form.controls.email.invalid && form.controls.email.touched"
            >
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <small>Please enter a valid email.</small>
            }
          </label>

          <label class="field">
            <span>Password</span>
            <div class="password-field" [class.invalid]="form.controls.password.invalid && form.controls.password.touched">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Enter your password"
              >
              <button class="password-toggle" type="button" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <small>Password is required.</small>
            }
          </label>

          <div class="form-row">
            <mat-checkbox>Remember me</mat-checkbox>
            <span class="secure-note">Secured access</span>
          </div>

          <button class="submit-button" type="submit" [disabled]="authStore.isLoading() || form.invalid">
            @if (authStore.isLoading()) {
              <mat-spinner diameter="22" />
            } @else {
              Sign In
            }
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #eef3f8;
    }

    .login-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(420px, 520px);
      background:
        linear-gradient(120deg, rgba(108, 211, 247, .16), transparent 36%),
        #eef3f8;
    }

    .brand-panel {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: clamp(40px, 7vw, 88px);
      color: #ffffff;
      background:
        linear-gradient(135deg, rgba(2, 13, 24, .96), rgba(4, 22, 39, .92)),
        url("data:image/svg+xml,%3Csvg width='1200' height='900' viewBox='0 0 1200 900' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1200' height='900' fill='%23041627'/%3E%3Cg opacity='.2' stroke='%236cd3f7'%3E%3Cpath d='M0 160h1200M0 320h1200M0 480h1200M0 640h1200M0 800h1200M160 0v900M320 0v900M480 0v900M640 0v900M800 0v900M960 0v900M1120 0v900'/%3E%3C/g%3E%3C/svg%3E");
      background-size: cover;
    }

    .brand-panel::after {
      content: "";
      position: absolute;
      right: -180px;
      bottom: -180px;
      width: 560px;
      height: 560px;
      background: radial-gradient(circle, rgba(108, 211, 247, .24), transparent 62%);
    }

    .brand-content {
      position: relative;
      z-index: 1;
      width: min(100%, 660px);
      display: grid;
      gap: 34px;
    }

    .brand-badge,
    .form-brand {
      display: inline-grid;
      place-items: center;
      width: max-content;
      min-width: 72px;
      height: 44px;
      padding: 0 14px;
      border-radius: 8px;
      font: 900 17px/1 Manrope, sans-serif;
      letter-spacing: 0;
    }

    .brand-badge {
      border: 1px solid rgba(255, 255, 255, .18);
      background: rgba(255, 255, 255, .1);
      color: #6cd3f7;
      backdrop-filter: blur(16px);
    }

    .eyebrow {
      margin: 0 0 14px;
      color: #6cd3f7;
      font: 800 12px/1.2 Manrope, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    h1 {
      max-width: 620px;
      margin: 0;
      font: 900 clamp(44px, 6vw, 74px)/.98 Manrope, sans-serif;
      letter-spacing: 0;
    }

    .hero-copy {
      max-width: 520px;
      margin: 22px 0 0;
      color: #c9d5e4;
      font-size: 18px;
      line-height: 1.65;
    }

    .dashboard-preview {
      width: min(100%, 500px);
      display: grid;
      gap: 20px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, .14);
      border-radius: 8px;
      background: rgba(255, 255, 255, .1);
      box-shadow: 0 24px 80px rgba(0, 0, 0, .32);
      backdrop-filter: blur(18px);
    }

    .preview-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .preview-top span,
    .preview-grid small {
      color: #9fb0c4;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .preview-top strong {
      color: #ffffff;
      font: 900 34px/1 Manrope, sans-serif;
    }

    .progress-row {
      height: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(255, 255, 255, .16);
    }

    .progress-row span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #6cd3f7, #78d8a8);
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .preview-grid div {
      padding: 16px;
      border-radius: 8px;
      background: rgba(255, 255, 255, .08);
    }

    .preview-grid strong {
      display: block;
      margin-top: 6px;
      color: #ffffff;
      font: 900 24px/1 Manrope, sans-serif;
    }

    .form-panel {
      display: grid;
      place-items: center;
      padding: clamp(24px, 5vw, 56px);
    }

    .login-card {
      width: min(100%, 430px);
      display: grid;
      gap: 18px;
      padding: clamp(28px, 4vw, 42px);
      border: 1px solid #e1e7ef;
      border-radius: 8px;
      background: rgba(255, 255, 255, .96);
      box-shadow: 0 24px 80px rgba(4, 22, 39, .12);
    }

    .form-brand {
      display: none;
      background: #041627;
      color: #6cd3f7;
    }

    .form-heading {
      display: grid;
      gap: 8px;
      margin-bottom: 2px;
    }

    h2 {
      margin: 0;
      color: #041627;
      font: 900 clamp(30px, 4vw, 38px)/1.08 Manrope, sans-serif;
      letter-spacing: 0;
    }

    .form-heading p {
      margin: 0;
      color: #515f74;
      font-size: 15px;
    }

    .submit-button {
      width: 100%;
    }

    .field {
      display: grid;
      gap: 8px;
      color: #041627;
    }

    .field span {
      font-size: 13px;
      font-weight: 800;
      color: #344054;
    }

    .field input {
      width: 100%;
      height: 50px;
      border: 1px solid #d7dee8;
      border-radius: 8px;
      background: #ffffff;
      color: #041627;
      font: 600 15px/1.2 'IBM Plex Sans', 'IBM Plex Sans Arabic', sans-serif;
      outline: none;
      padding: 0 14px;
      transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
    }

    .field input::placeholder {
      color: #9aa4b2;
      font-weight: 500;
    }

    .field input:focus,
    .password-field:focus-within {
      border-color: #0073e6;
      box-shadow: 0 0 0 3px rgba(0, 115, 230, .12);
    }

    .field input.invalid,
    .password-field.invalid {
      border-color: #ba1a1a;
    }

    .field small {
      color: #ba1a1a;
      font-size: 12px;
      font-weight: 700;
    }

    .password-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      height: 50px;
      border: 1px solid #d7dee8;
      border-radius: 8px;
      background: #ffffff;
      transition: border-color .15s ease, box-shadow .15s ease;
    }

    .password-field input {
      height: 48px;
      border: 0;
      border-radius: 8px;
      box-shadow: none;
    }

    .password-field input:focus {
      box-shadow: none;
    }

    .password-toggle {
      height: 36px;
      margin-right: 8px;
      padding: 0 10px;
      border: 0;
      border-radius: 6px;
      background: #eef3f8;
      color: #041627;
      font: 800 12px/1 Manrope, sans-serif;
      cursor: pointer;
    }

    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 40px;
    }

    .secure-note {
      color: #1a8c5c;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }

    .submit-button {
      display: inline-grid;
      place-items: center;
      height: 52px;
      border: 0;
      border-radius: 8px;
      background: #041627;
      color: #ffffff;
      font: 900 15px/1 Manrope, sans-serif;
      cursor: pointer;
      box-shadow: 0 14px 28px rgba(4, 22, 39, .22);
      transition: transform .15s ease, background-color .15s ease, box-shadow .15s ease;
    }

    .submit-button:hover:not(:disabled) {
      background: #0a2236;
      transform: translateY(-1px);
      box-shadow: 0 18px 34px rgba(4, 22, 39, .26);
    }

    .submit-button:disabled {
      cursor: not-allowed;
      opacity: .48;
      box-shadow: none;
    }

    mat-spinner {
      margin: 0 auto;
    }

    .error-banner {
      padding: 12px 14px;
      border: 1px solid rgba(186, 26, 26, .22);
      border-radius: 8px;
      background: #ffdad6;
      color: #93000a;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .login-page {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        display: none;
      }

      .form-panel {
        min-height: 100vh;
        background:
          linear-gradient(135deg, rgba(4, 22, 39, .06), transparent 42%),
          #eef3f8;
      }

      .form-brand {
        display: inline-grid;
      }
    }

    @media (max-width: 520px) {
      .form-panel {
        padding: 18px;
      }

      .login-card {
        padding: 26px 20px;
      }

      .form-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
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
