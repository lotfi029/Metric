export interface UserListResponse {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface DetailedUserResponse extends UserListResponse {
  // Same as UserListResponse for now
}

export interface AddUserRequest {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  userName: string;
  roleId: string | null;
  departmentId: string | null;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

export interface CreateUserResponse {
  userId: string;
  userName: string;
  email: string;
  password: string;
}
