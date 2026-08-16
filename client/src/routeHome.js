export const homeByRole = {
  saas_super_admin: '/dashboard',
  system_admin: '/admin',
  regional_corporate_admin: '/dashboard',
  general_manager: '/dashboard',
  front_desk: '/dashboard',
  reservations_agent: '/reservations',
  cashier: '/folios',
  housekeeping_attendant: '/housekeeping',
  housekeeping_supervisor: '/housekeeping',
  fnb_cashier_waiter: '/pos',
  kitchen_staff: '/m/kitchen-tickets',
  revenue_manager: '/revenue-distribution',
  sales_events: '/ops/events',
  finance: '/folios',
  engineering: '/ops/maintenance-work-orders',
};

export function getHomeForRole(role) {
  return homeByRole[role] || '/dashboard';
}
