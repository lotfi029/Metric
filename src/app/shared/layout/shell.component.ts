import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopnavComponent } from '../components/topnav/topnav.component';
import { DetailedUserResponse } from '@core/models/user.model';
import { MOCK_EMPLOYEES } from '@core/mock/index';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopnavComponent],
  template: `
    <div class="flex h-screen bg-[#f2f4f6]">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-topnav [currentUser]="currentUser()"></app-topnav>
        <div class="flex-1 overflow-auto ml-64 mt-16 p-8">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ShellComponent implements OnInit {
  currentUser = signal<DetailedUserResponse | null>(null);

  ngOnInit() {
    // Use mock employee for current user (emp-001 = Sara Nasser = "manager" account)
    const currentMock = MOCK_EMPLOYEES[0];
    this.currentUser.set({
      id: currentMock.id,
      firstName: currentMock.firstName,
      lastName: currentMock.lastName,
      userName: currentMock.userName,
      email: currentMock.email,
      isActive: currentMock.isActive,
      createdAt: currentMock.createdAt,
      lastLoginAt: currentMock.lastLoginAt
    } as DetailedUserResponse);
  }
}
