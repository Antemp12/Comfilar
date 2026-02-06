/**
 * User Role Types for Comfilar
 * Defines user roles and their permissions
 */

export enum UserRole {
  CLIENT = "client",
  EMPLOYEE = "employee",
  ADMIN = "admin",
}

export interface UserPermissions {
  canViewCatalog: boolean;
  canCreateQuote: boolean;
  canScheduleMeeting: boolean;
  canViewOwnOrders: boolean;
  canManageMaterials: boolean;
  canApproveQuotes: boolean;
  canUpdateOrderStatus: boolean;
  canManageUsers: boolean;
  canAccessAdmin: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  [UserRole.CLIENT]: {
    canViewCatalog: true,
    canCreateQuote: true,
    canScheduleMeeting: true,
    canViewOwnOrders: true,
    canManageMaterials: false,
    canApproveQuotes: false,
    canUpdateOrderStatus: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  [UserRole.EMPLOYEE]: {
    canViewCatalog: true,
    canCreateQuote: true,
    canScheduleMeeting: true,
    canViewOwnOrders: true,
    canManageMaterials: true,
    canApproveQuotes: true,
    canUpdateOrderStatus: true,
    canManageUsers: false,
    canAccessAdmin: true,
  },
  [UserRole.ADMIN]: {
    canViewCatalog: true,
    canCreateQuote: true,
    canScheduleMeeting: true,
    canViewOwnOrders: true,
    canManageMaterials: true,
    canApproveQuotes: true,
    canUpdateOrderStatus: true,
    canManageUsers: true,
    canAccessAdmin: true,
  },
};

export function getUserPermissions(role: UserRole): UserPermissions {
  return rolePermissions[role];
}

export function hasPermission(
  role: UserRole,
  permission: keyof UserPermissions
): boolean {
  return rolePermissions[role][permission];
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.EMPLOYEE;
}
