import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { DetailedUserResponse } from '../../../core/models/user.model';
import { RoleResponse } from '../../../core/models/role.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user = signal<DetailedUserResponse | null>(null);
  roles = signal<RoleResponse[]>([]);
  userForm: FormGroup;
  isLoading = signal(true);
  isSaving = signal(false);
  userId = signal('');

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [''],
      roleId: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.userId.set(userId);
      this.loadUser(userId);
      this.loadRoles();
    });
  }

  loadUser(userId: string) {
    this.isLoading.set(true);
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.toastService.showError('Failed to load user details');
        this.isLoading.set(false);
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  onSave() {
    if (this.userForm.invalid) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    const updateRequest = {
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value
    };

    this.userService.updateUser(this.userId(), updateRequest).subscribe({
      next: () => {
        this.toastService.showSuccess('User updated successfully');
        this.loadUser(this.userId());
        this.isSaving.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.showError('Failed to update user');
      }
    });
  }

  toggleActive() {
    if (!this.user()) return;

    const action = this.user()!.isActive
      ? this.userService.deactivateUser(this.userId())
      : this.userService.activateUser(this.userId());

    action.subscribe({
      next: () => {
        this.toastService.showSuccess(
          this.user()!.isActive ? 'User deactivated' : 'User activated'
        );
        this.loadUser(this.userId());
      },
      error: (err) => {
        this.toastService.showError('Failed to update user status');
      }
    });
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  getInitials(user: DetailedUserResponse): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
