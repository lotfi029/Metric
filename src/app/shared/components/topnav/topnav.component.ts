import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailedUserResponse } from '@core/models/user.model';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent {
  @Input() currentUser: DetailedUserResponse | null = null;
  pageTitle = signal('Dashboard');

  getInitials(user: DetailedUserResponse): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
