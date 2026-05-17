import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-40 h-16 bg-white border-b border-[#e8eaed] px-4 md:px-8 flex items-center gap-4 flex-shrink-0">
      <button type="button" class="md:hidden btn-ghost px-2" aria-label="Open navigation">
        <span class="material-symbols-outlined">menu</span>
      </button>

      <div class="min-w-0">
        <p class="font-['Manrope'] font-bold text-[#101828] leading-tight">{{ pageTitle() }}</p>
        <p class="hidden md:block text-xs text-[#9aa4b2]">{{ breadcrumb() }}</p>
      </div>

      <div class="flex-1"></div>

      <button type="button" class="btn-ghost px-2" aria-label="Search">
        <span class="material-symbols-outlined">search</span>
      </button>
      <button type="button" class="btn-secondary px-3 py-1.5" (click)="translation.toggle()">
        {{ translation.lang().toUpperCase() }}
      </button>
      <button type="button" class="relative btn-ghost px-2" aria-label="Notifications">
        <span class="material-symbols-outlined">notifications</span>
        <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
      </button>
      <div class="h-8 w-px bg-[#e8eaed]"></div>

      <div class="relative">
        <button type="button" class="flex items-center gap-2" (click)="menuOpen.set(!menuOpen())">
          <span class="w-9 h-9 rounded-full grid place-items-center bg-[#e0f5fe] text-[#003547] text-xs font-bold">{{ initials() }}</span>
          <span class="hidden lg:inline text-sm font-semibold text-[#344054]">{{ authStore.user()?.userName || 'User' }}</span>
          <span class="material-symbols-outlined text-[#9aa4b2] text-lg">expand_more</span>
        </button>
        @if (menuOpen()) {
          <div class="absolute right-0 mt-2 w-48 card p-1 shadow-lg">
            <a routerLink="/profile" class="block px-3 py-2 rounded-lg text-sm text-[#344054] hover:bg-[#f8f9fa]" (click)="menuOpen.set(false)">My Profile</a>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#344054] hover:bg-[#f8f9fa]">Settings</button>
            <div class="my-1 border-t border-[#e8eaed]"></div>
            <button type="button" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#ba1a1a] hover:bg-[#ffdad6]" (click)="logout()">Sign out</button>
          </div>
        }
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly authStore = inject(AuthStore);
  readonly translation = inject(TranslationService);
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  readonly pageTitle = computed(() => this.titleFromUrl(this.currentUrl()));
  readonly breadcrumb = computed(() => `DMS / ${this.currentUrl().split('/').filter(Boolean).map(this.formatSegment).join(' / ') || 'Dashboard'}`);
  readonly initials = computed(() => this.authStore.user()?.userName
    ?.split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U');

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }

  async logout(): Promise<void> {
    await this.authStore.logout();
    this.menuOpen.set(false);
    await this.router.navigate(['/login']);
  }

  private titleFromUrl(url: string): string {
    return this.formatSegment(url.split('/').filter(Boolean).at(-1) ?? 'dashboard');
  }

  private formatSegment(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
