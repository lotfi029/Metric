import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { TranslationService } from '../translation.service';

interface NavItem {
  label: string;
  labelAr: string;
  icon: string;
  route: string;
  requiredPermission: string | null;
  section: 'main' | 'admin' | 'system';
}

const NAV: NavItem[] = [
  { label: 'Dashboard', labelAr: 'Dashboard', icon: 'dashboard', route: '/dashboard', requiredPermission: null, section: 'main' },
  { label: 'Employees', labelAr: 'Employees', icon: 'badge', route: '/employees', requiredPermission: PERMISSIONS.employees.read, section: 'main' },
  { label: 'Clients', labelAr: 'Clients', icon: 'handshake', route: '/clients', requiredPermission: PERMISSIONS.clients.read, section: 'main' },
  { label: 'Departments', labelAr: 'Departments', icon: 'corporate_fare', route: '/departments', requiredPermission: PERMISSIONS.departments.read, section: 'main' },
  { label: 'Finance', labelAr: 'Finance', icon: 'payments', route: '/finance', requiredPermission: null, section: 'main' },
  { label: 'Users', labelAr: 'Users', icon: 'manage_accounts', route: '/users', requiredPermission: PERMISSIONS.users.read, section: 'admin' },
  { label: 'Roles', labelAr: 'Roles', icon: 'shield_person', route: '/roles', requiredPermission: PERMISSIONS.roles.read, section: 'admin' },
  { label: 'Audit Log', labelAr: 'Audit Log', icon: 'history', route: '/audit', requiredPermission: PERMISSIONS.audit.read, section: 'system' },
  { label: 'My Profile', labelAr: 'My Profile', icon: 'person', route: '/profile', requiredPermission: null, section: 'system' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden md:flex w-[256px] flex-shrink-0 h-screen overflow-hidden bg-[#041627] text-white flex-col">
      <div class="h-16 flex items-center gap-3 px-5 border-b border-white/10 flex-shrink-0">
        <div class="w-9 h-9 rounded-xl bg-[#6cd3f7] text-[#041627] grid place-items-center font-['Manrope'] font-black">D</div>
        <div class="min-w-0">
          <p class="font-['Manrope'] font-bold leading-tight">DMS</p>
          <p class="text-[10px] text-[#8192a7] uppercase tracking-widest">Operations</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div class="space-y-1">
          @for (item of navBySection().main; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-link">
              <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
              <span>{{ translation.isRtl() ? item.labelAr : item.label }}</span>
            </a>
          }
        </div>

        @if (navBySection().admin.length) {
          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8192a7]">Administration</p>
            @for (item of navBySection().admin; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="active" class="nav-link">
                <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                <span>{{ translation.isRtl() ? item.labelAr : item.label }}</span>
              </a>
            }
          </div>
        }

        @if (navBySection().system.length) {
          <div class="space-y-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8192a7]">System</p>
            @for (item of navBySection().system; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="active" class="nav-link">
                <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                <span>{{ translation.isRtl() ? item.labelAr : item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <div class="p-3 border-t border-white/10 flex-shrink-0">
        <div class="flex items-center gap-3 rounded-[12px] bg-white/5 p-3">
          <div class="w-9 h-9 rounded-full grid place-items-center text-xs font-bold" [style.background]="avatarColor()">
            {{ initials() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ authStore.user()?.userName || 'User' }}</p>
            <p class="truncate text-[11px] text-[#8192a7]">{{ authStore.roles().join(', ') || 'Member' }}</p>
          </div>
          <button type="button" (click)="logout()" class="material-symbols-outlined text-[#ffb4ab] hover:text-white transition-colors">logout</button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }
    aside { transition: width 150ms ease; }
  `],
})
export class SidebarComponent {
  readonly authStore = inject(AuthStore);
  readonly translation = inject(TranslationService);
  private readonly router = inject(Router);

  readonly visibleNavItems = computed(() =>
    NAV.filter(item => !item.requiredPermission || this.authStore.can(item.requiredPermission)),
  );
  readonly navBySection = computed(() => ({
    main: this.visibleNavItems().filter(item => item.section === 'main'),
    admin: this.visibleNavItems().filter(item => item.section === 'admin'),
    system: this.visibleNavItems().filter(item => item.section === 'system'),
  }));
  readonly initials = computed(() => this.authStore.user()?.userName
    ?.split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U');
  readonly avatarColor = computed(() => {
    const palette = ['#6cd3f7', '#e0eeff', '#e6f7ef', '#fff0cc', '#ffdad6', '#d0d5dd'];
    const name = this.authStore.user()?.userName ?? '';
    const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
  });

  async logout(): Promise<void> {
    await this.authStore.logout();
    await this.router.navigate(['/login']);
  }
}
