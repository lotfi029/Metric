import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../core/auth/auth.store';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <header class="topbar">
      <button mat-icon-button class="mobile-menu" type="button"><mat-icon>menu</mat-icon></button>
      <div class="context">
        <strong>Workspace</strong>
        <span>Permission-scoped operations</span>
      </div>
      <div class="spacer"></div>
      <button mat-button class="lang" type="button" (click)="translation.toggle()">{{ translation.lang().toUpperCase() }}</button>
      <button mat-icon-button type="button" aria-label="Notifications"><mat-icon>notifications</mat-icon></button>
      <div class="user">
        <span class="avatar">{{ initials() }}</span>
        <span class="name">{{ authStore.user()?.userName }}</span>
      </div>
      <button mat-icon-button type="button" aria-label="Logout" (click)="logout()"><mat-icon>logout</mat-icon></button>
    </header>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 10; height: 64px; display: flex; align-items: center; gap: 10px; padding: 0 22px; border-bottom: 1px solid #dbe5ef; background: rgba(255,255,255,.92); backdrop-filter: blur(12px); box-sizing: border-box; }
    .context { display: grid; gap: 2px; line-height: 1.1; }
    .context strong { color: #172033; }
    .context span { color: #64748b; font-size: 12px; }
    .spacer { flex: 1; }
    .lang { border: 1px solid #e2e8f0; border-radius: 8px; min-width: 54px; }
    .user { display: flex; align-items: center; gap: 10px; color: #0f172a; font-weight: 600; }
    .avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 13px; font-weight: 800; }
    .mobile-menu { display: none; }
    @media (max-width: 720px) { .mobile-menu { display: inline-flex; } .name, .context { display: none; } }
  `],
})
export class TopbarComponent {
  readonly authStore = inject(AuthStore);
  readonly translation = inject(TranslationService);
  private readonly router = inject(Router);
  readonly initials = computed(() => {
    const name = this.authStore.user()?.userName ?? '';
    return name.split(/[.\s_-]+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  });

  async logout(): Promise<void> {
    await this.authStore.logout();
    await this.router.navigate(['/login']);
  }
}
