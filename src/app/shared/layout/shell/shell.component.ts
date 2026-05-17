import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <main class="main">
        <app-topbar />
        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; display: flex; background: #eef3f8; }
    .main { flex: 1; min-width: 0; background: #eef3f8; }
    .content { min-height: calc(100vh - 64px); max-width: 1440px; margin: 0 auto; padding: 24px; box-sizing: border-box; background: #eef3f8; }
    @media (max-width: 720px) { .content { padding: 14px; } }
  `],
})
export class ShellComponent {}
