export enum Permission {
  CREATE_ORDER = 'create_order',
  READ_ORDER = 'read_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',
}

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export const RolesPermissions = {
  [Role.ADMIN]: [
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
    Permission.DELETE_ORDER,
  ],
  [Role.MANAGER]: [
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
  ],
  [Role.USER]: [Permission.CREATE_ORDER, Permission.READ_ORDER],
};
