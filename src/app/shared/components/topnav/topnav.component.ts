import { Component, Input, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DetailedUserResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.css']
})
export class TopnavComponent implements OnInit {
  @Input() currentUser: DetailedUserResponse | null = null;
  pageTitle = signal('Dashboard');

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) {
        this.pageTitle.set(data['title']);
      }
    });
  }

  userInitials = computed(() => {
    if (this.currentUser) {
      return this.getInitials(this.currentUser);
    }
    return '';
  });

  getInitials(user: DetailedUserResponse): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
