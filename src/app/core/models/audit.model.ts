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
  timestamp: string; // ISO date string
}

export interface AuditPagedResult {
  items: AuditLogResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogQuery {
  userId?: string;
  module?: string;
  action?: string;
  outcome?: string;
  entityName?: string;
  entityId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  desc?: boolean;
}
