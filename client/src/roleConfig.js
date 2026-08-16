export const rolePanels={
  saas_super_admin:{title:'SaaS Super Admin',accent:'Platform command',quick:['admin','dashboard','reports','audit','approvals'],groups:['Platform','Enterprise','Operations','Commercial']},
  system_admin:{title:'System Administration',accent:'Identity, integrations & configuration',quick:['admin','audit','integrations','documents','dashboard'],groups:['Platform','Enterprise']},
  general_manager:{title:'General Manager',accent:'Property performance & approvals',quick:['dashboard','reservations','reports','approvals','housekeeping'],groups:['Operations','Commercial','Finance']},
  front_desk:{title:'Front Desk',accent:'Arrivals, stays & guest service',quick:['reservations','calendar','rooms','folios','guest-experience'],groups:['Front Office','Guest']},
  reservations_agent:{title:'Reservations Desk',accent:'Bookings, rates & availability',quick:['reservations','calendar','revenue-distribution','crs-allotments','corporate-accounts'],groups:['Front Office','Commercial']},
  cashier:{title:'Cashier',accent:'Settlements, folios & shifts',quick:['folios','cashier-shifts','reports','ar-accounts'],groups:['Finance']},
  housekeeping_attendant:{title:'Housekeeping',accent:'Assigned rooms & service readiness',quick:['housekeeping','rooms','minibar-entries','laundry-orders','service-requests'],groups:['Operations']},
  housekeeping_supervisor:{title:'Housekeeping Supervisor',accent:'Inspection, workload & room release',quick:['housekeeping','rooms','linen-items','reports'],groups:['Operations']},
  fnb_cashier_waiter:{title:'Restaurant POS',accent:'Tables, orders & room charge',quick:['pos-orders','kitchen-tickets','folios'],groups:['F&B']},
  kitchen_staff:{title:'Kitchen Display',accent:'Production queue & timers',quick:['kitchen-tickets','pos-orders'],groups:['F&B']},
  revenue_manager:{title:'Revenue Manager',accent:'Pricing, distribution & forecast',quick:['revenue-distribution','rate-plans','crs-allotments','channel-mappings','forecasts'],groups:['Commercial']},
  sales_events:{title:'Sales & Events',accent:'Groups, corporate & banquets',quick:['events','corporate-accounts','travel-agents','reservations'],groups:['Commercial']},
  finance:{title:'Finance',accent:'A/R, A/P, audit & controls',quick:['folios','ar-accounts','night-audits','reports','approvals'],groups:['Finance']},
  engineering:{title:'Engineering',accent:'Maintenance, assets & energy',quick:['maintenance-work-orders','preventive-maintenance','assets','iot-devices','energy-readings'],groups:['Engineering']},
  regional_corporate_admin:{title:'Corporate Operations',accent:'Multi-property governance',quick:['dashboard','reports','admin','audit','revenue-distribution'],groups:['Enterprise','Commercial']}
};
