import { UserListResponse } from './user.model';

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  departmentHeadId?: string;
  departmentHead?: UserListResponse | null;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description: string;
}

export interface DepartmentUserRequest {
  userId: string;
}
