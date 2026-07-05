import type { RoleName } from './types/Login';

/** Landing route per role. Must point to a route the role can actually access. */
export const ROLE_HOME: Record<RoleName, string> = {
  ADMIN:   '/',
  CASHIER: '/orders',
  WAITER:  '/tables',
  CHEF:    '/orders',
};

export function roleHome(role?: RoleName | null): string {
  return role ? ROLE_HOME[role] : '/';
}
