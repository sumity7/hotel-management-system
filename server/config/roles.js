module.exports = {
  saas_super_admin: ['*'],
  system_admin: ['*'],
  general_manager: ['dashboard.view','reservations.*','rooms.*','folios.*','housekeeping.*','modules.*','reports.*','approvals.*','audit.view','admin.view'],
  front_desk: ['dashboard.view','reservations.*','rooms.view','folios.*','housekeeping.view','modules.service-requests.*','modules.transport-requests.*','modules.loyalty-accounts.update','modules.loyalty-accounts.view','modules.upsell-offers.view','modules.upsell-offers.update','reports.view'],
  reservations_agent: ['dashboard.view','reservations.*','rooms.view','modules.rate-plans.view','modules.crs-allotments.view','modules.channel-mappings.view','modules.channel-mappings.update','modules.groups.*','modules.corporate-accounts.view','modules.travel-agents.view','reports.view'],
  cashier: ['dashboard.view','folios.*','modules.cashier-shifts.*','modules.ar-accounts.view','reports.view'],
  housekeeping_attendant: ['dashboard.view','rooms.view','housekeeping.view','housekeeping.update','modules.minibar-entries.*','modules.laundry-orders.*','modules.service-requests.view'],
  housekeeping_supervisor: ['dashboard.view','rooms.view','housekeeping.*','modules.minibar-entries.*','modules.laundry-orders.*','modules.linen-items.*','reports.view'],
  fnb_cashier_waiter: ['dashboard.view','reservations.view','modules.pos-orders.*','modules.restaurant-tables.*','modules.menu-items.view','modules.kitchen-tickets.view','folios.view'],
  kitchen_staff: ['dashboard.view','modules.kitchen-tickets.*','modules.pos-orders.view','modules.menu-items.view'],
  revenue_manager: ['dashboard.view','reservations.view','rooms.view','modules.rate-plans.*','modules.rate-rules.*','modules.crs-allotments.*','modules.channel-mappings.*','modules.forecasts.*','modules.groups.create','reports.*'],
  sales_events: ['dashboard.view','modules.corporate-accounts.*','modules.travel-agents.view','modules.groups.*','modules.events.*','modules.conference-rooms.*','modules.spa-appointments.view','reservations.view','reports.view'],
  finance: ['dashboard.view','folios.*','modules.ar-accounts.*','modules.ap-accounts.*','modules.night-audits.*','modules.cashier-shifts.*','modules.tax-rules.*','reports.*','approvals.*','audit.view'],
  engineering: ['dashboard.view','rooms.view','modules.maintenance-work-orders.*','modules.preventive-maintenance.*','modules.assets.*','modules.energy-readings.view','modules.iot-devices.view','modules.transport-requests.*','reports.view'],
  regional_corporate_admin: ['dashboard.view','reservations.*','rooms.*','reports.*','admin.view','audit.view','approvals.view','modules.*']
};
