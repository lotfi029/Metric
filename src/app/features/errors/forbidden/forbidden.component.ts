import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="forbidden">
      <h1>403</h1>
      <p>You do not have permission to view this page.</p>
      <a mat-raised-button color="primary" routerLink="/dashboard">Back to Dashboard</a>
    </section>
  `,
  styles: [`.forbidden { display: grid; place-items: center; gap: 12px; min-height: 60vh; text-align: center; } h1 { margin: 0; font-size: 72px; color: #0f172a; } p { color: #64748b; }`],
})
export class ForbiddenComponent {}
