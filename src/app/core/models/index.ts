export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
}
export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface AuthState {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isSupervisor: boolean;
}

export interface UserListResponse {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
export interface DetailedUserResponse extends UserListResponse {
  phoneNumber: string | null;
  roles: string[];
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

export interface EmployeeListResponse {
  id: string;
  appUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  isActive: boolean;
  departmentId: string | null;
  departmentName: string | null;
}
export interface EmployeeResponse extends EmployeeListResponse {
  userName: string;
  hireDate: string;
  createdAt: string;
  lastLoginAt: string | null;
  notes: string | null;
}
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  jobTitle: string;
  roleId: string | null;
  departmentId: string | null;
  notes: string | null;
  grantPermissions: string[];
  denyPermissions: string[];
}
export interface EmployeeQueryFilter {
  jobTitle?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
  hireDateMin?: string;
  hireDateMax?: string;
  lastLoginDateMin?: string;
  lastLoginDateMax?: string;
  createdAtMin?: string;
  createdAtMax?: string;
  userType?: string;
}

export interface ClientResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  isActive: boolean;
  phoneNumber: string | null;
  address: string | null;
  notes: string | null;
}
export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  phone: string;
  address: string;
  notes?: string;
}
export interface UpdateClientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  departmentHeadId?: string;
  departmentHead?: EmployeeListResponse | null;
}
export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}
export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
}
export interface DepartmentUserRequest {
  userId: string;
}

export interface RoleResponse {
  id: string;
  roleName: string;
}

export interface PermissionResponse {
  id: number;
  roleId: string;
  group: string;
  name: string;
  displayName: string;
  description: string | null;
}
export interface GrantPermissionRequest {
  targetUserId: string;
  permission: string;
  reason?: string;
  expiresAt?: string;
}
export interface DenyPermissionRequest {
  targetUserId: string;
  permission: string;
  reason?: string;
}
export interface RevokePermissionRequest {
  targetUserId: string;
  permission: string;
}
export interface EffectivePermissionsResponse {
  userId: string;
  permissions: string[];
  overrides: PermissionOverrideDto[];
}
export interface PermissionOverrideDto {
  id: string;
  permission: string;
  isGranted: boolean;
  grantedById: string;
  reason: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  module: string | null;
  description: string | null;
  outcome: string;
  failureReason: string | null;
  oldValues: string | null;
  newValues: string | null;
  changedColumns: string | null;
  requestPath: string | null;
  requestMethod: string | null;
  durationMs: number | null;
  timestamp: string;
}
export interface AuditPagedResult {
  items: AuditLogResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface AuditQueryParams {
  page?: number;
  pageSize?: number;
  desc?: boolean;
  userId?: string;
  entityName?: string;
  entityId?: string;
  action?: string;
  module?: string;
  from?: string;
  to?: string;
}
