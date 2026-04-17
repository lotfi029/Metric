export interface RoleResponse {
  id: string;
  roleName: string;
}

export interface CreateRoleCommand {
  roleName: string;
}

export interface UpdateRoleCommand {
  roleId: string;
  newRoleName: string;
}

export interface AssignRoleToUserCommand {
  userId: string;
  roleId: string;
}
