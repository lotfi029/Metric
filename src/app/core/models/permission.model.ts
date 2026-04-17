export interface PermissionResponse {
  id: number;
  roleId: string;
  group: string;
  name: string;
  displayName: string;
  description: string | null;
}

export interface PermissionRequest {
  permissionName: string;
}
