import { AuditLogResponse, AuditPagedResult } from '../models/audit.model';

export const MOCK_AUDIT_LOGS: AuditLogResponse[] = [
  { id:'aud-001', userId:'emp-001', userName:'sara.nasser', userEmail:'sara.nasser@metric.ae', ipAddress:'10.0.0.12', action:'UserCreated', entityName:'ApplicationUser', entityId:'emp-007', module:'Users', description:"User 'fatima.alzaabi' created.", outcome:'Success', failureReason:null, oldValues:null, newValues:'{"firstName":"Fatima","lastName":"Al-Zaabi"}', changedColumns:null, requestPath:'/api/users/create', requestMethod:'POST', durationMs:245, timestamp:'2024-12-17T08:45:12Z' },
  { id:'aud-002', userId:'emp-001', userName:'sara.nasser', userEmail:'sara.nasser@metric.ae', ipAddress:'10.0.0.12', action:'Login', entityName:'ApplicationUser', entityId:'emp-001', module:'Auth', description:"User sara.nasser logged in successfully.", outcome:'Success', failureReason:null, oldValues:null, newValues:null, changedColumns:null, requestPath:'/api/auth/login', requestMethod:'POST', durationMs:312, timestamp:'2024-12-17T08:30:05Z' },
  { id:'aud-003', userId:'emp-002', userName:'omar.khalil', userEmail:'omar.khalil@metric.ae', ipAddress:'10.0.0.15', action:'Login', entityName:'ApplicationUser', entityId:'emp-002', module:'Auth', description:"User omar.khalil logged in successfully.", outcome:'Success', failureReason:null, oldValues:null, newValues:null, changedColumns:null, requestPath:'/api/auth/login', requestMethod:'POST', durationMs:287, timestamp:'2024-12-17T09:15:22Z' },
  { id:'aud-004', userId:'emp-001', userName:'sara.nasser', userEmail:'sara.nasser@metric.ae', ipAddress:'10.0.0.12', action:'RoleAssignedToUser', entityName:'ApplicationUser', entityId:'emp-007', module:'Roles', description:"Role 'Sales Executive' assigned to user emp-007.", outcome:'Success', failureReason:null, oldValues:null, newValues:null, changedColumns:null, requestPath:'/api/roles/assign-to-user', requestMethod:'POST', durationMs:198, timestamp:'2024-12-17T08:46:00Z' },
  { id:'aud-005', userId:'emp-001', userName:'sara.nasser', userEmail:'sara.nasser@metric.ae', ipAddress:'10.0.0.12', action:'Login', entityName:'ApplicationUser', entityId:null, module:'Auth', description:"Failed login attempt for user unknown@test.com.", outcome:'Failure', failureReason:'Invalid credentials', oldValues:null, newValues:null, changedColumns:null, requestPath:'/api/auth/login', requestMethod:'POST', durationMs:95, timestamp:'2024-12-16T14:22:33Z' },
  { id:'aud-006', userId:'emp-002', userName:'omar.khalil', userEmail:'omar.khalil@metric.ae', ipAddress:'10.0.0.15', action:'DepartmentUpdated', entityName:'Department', entityId:'dept-002', module:'Departments', description:"Department 'Technical Office' updated.", outcome:'Success', failureReason:null, oldValues:'{"name":"Technical"}', newValues:'{"name":"Technical Office"}', changedColumns:'["name"]', requestPath:'/api/departments/dept-002/update', requestMethod:'PUT', durationMs:178, timestamp:'2024-12-16T10:05:44Z' },
  { id:'aud-007', userId:'emp-001', userName:'sara.nasser', userEmail:'sara.nasser@metric.ae', ipAddress:'10.0.0.12', action:'PermissionAssignedToRole', entityName:'ApplicationRoleClaim', entityId:null, module:'Permissions', description:"Permission 'projects.create' assigned to role Design Manager.", outcome:'Success', failureReason:null, oldValues:null, newValues:null, changedColumns:null, requestPath:'/api/permissions/role123/create', requestMethod:'POST', durationMs:156, timestamp:'2024-12-15T11:30:00Z' }
];

export const MOCK_AUDIT_PAGED: AuditPagedResult = {
  items: MOCK_AUDIT_LOGS,
  totalCount: 247,
  page: 1,
  pageSize: 25,
  totalPages: 10
};
