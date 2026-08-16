# Hotel Management System Premium Enterprise — V9 Client Requirement Matrix

This delivery is mapped to the supplied Premium & Enterprise Feature Specification. V9 keeps the integrated PMS/CRS/POS/CRM/Revenue/Operations/Finance/Analytics/Multi-Property architecture and adds dedicated operational workflow screens for high-frequency hotel operations.

## Requirement coverage groups

### Front Office / PMS
1. Executive Dashboard — implemented dashboard/KPI foundation.
2. Reservation Management — create/update plus advanced control actions and tenant/RBAC safeguards.
3. Tape Chart — visual room/stay calendar with room move / stay controls.
4. Check-In — dedicated check-in desk and registration data capture foundation.
5. Check-Out & Folio — charges, payments, refunds/credit notes, checkout and housekeeping transition.
6. Room Management — room status and room master.
7. Room Type Management — configurable room type records.
8. Rate Plans & Pricing — configurable rate plans and commercial controls.
9. Dynamic Pricing / Revenue — rate quote and revenue controls.

### Distribution / Commercial
10. CRS — centralized availability/allotment foundation.
11. Direct Booking Engine — public booking flow, add-ons and online payment layer.
12. Channel Manager — channel mapping/sync records and integration-ready control.
13. Group Booking — group data/workflow foundation.

### Guest CRM / Digital Journey
14. Guest Profiles / CRM — guest identity and relationship data.
15. Guest History — reservation/stay history foundation.
16. Loyalty — loyalty accounts and transactions/configuration foundation.
17. Service Requests — guest request workflow.
18. Automated Guest Journey — journey records/templates foundation.
19. Upselling — upsell offer records and booking add-ons.
20. AI Concierge — assistant/service-routing foundation.

### Housekeeping / Room Operations
21. Housekeeping Management — room status and task controls.
22. Housekeeping Tasks — assignment and task records.
23. Laundry — dedicated V9 workflow screen, status lifecycle, automatic folio posting on delivery.
24. Linen — dedicated V9 operational screen and stock lifecycle records.
25. Minibar — dedicated V9 operational screen, folio posting workflow.

### F&B / Spa / Events
26. Restaurant POS — order/payment/room-charge foundation.
27. Room Service — service request / POS foundation.
28. KDS — kitchen ticket records/status.
29. Spa & Wellness — dedicated V9 operational screen, lifecycle and folio posting.
30. Banquet & Events — dedicated V9 event workflow and BEO status control.
31. Conference Rooms — configurable records.

### Inventory / Procurement
32. Inventory — dedicated V9 stock control screen and stock adjustment transactions.
33. Purchase Management — dedicated procurement workflow PR → approval → RFQ → quotation comparison → PO → GRN → supplier invoice → payment handoff.
34. Supplier Management — supplier master and records.

### Finance / Commercial Accounts
35. Accounting & Finance — A/R/A/P and reporting foundation.
36. Night Audit — dedicated night-audit route/workflow.
37. Cashier — dedicated V9 cashier control surface and close/variance workflow.
38. Corporate Accounts — account/rate/billing records.
39. Travel Agents — agency/commission records.

### Engineering / Security
40. Transportation — dedicated V9 lifecycle and folio posting workflow.
41. Maintenance — dedicated V9 work-order lifecycle and room out-of-order handling.
42. Preventive Maintenance — dedicated V9 plan screen and work-order generation.
43. Assets — dedicated V9 lifecycle/register screen.
44. Lost & Found — dedicated V9 custody workflow.
45. Security / Incident — dedicated V9 incident workflow.

### Staff / Governance
46. Employee / HR — employee master.
47. Shift Management — dedicated V9 shift screen and approval action.
48. Attendance — dedicated V9 attendance records; punch API available.
49. RBAC — role/permission middleware and role-specific navigation.
50. Approval Workflow — approval route and audit history foundation.
51. Audit Trail — application audit log.
52. Document Management — secure document metadata/storage foundation.

### Analytics / AI
53. Reporting — operational reporting endpoints/UI.
54. Advanced Analytics — dashboard/report analytics foundation.
55. Forecasting — 14-day rule/statistical forecast generation plus forecast records.
56. AI Management Assistant — permission-scoped assistant foundation.

### Enterprise / Integrations
57. Multi-Property — organization/brand/region/property hierarchy foundation.
58. Central Guest Database — shared guest profile foundation.
59. Multi-Currency — configurable currency records.
60. Multi-Language — translation/localization records.
61. Tax Configuration — tax-rule records.
62. API & Integration Platform — integration records, adapter validation and APIs.
63. Smart Door Lock — software integration/key records; live operation requires supported lock vendor credentials/hardware.
64. IoT Smart Room — device/integration records; live operation requires IoT vendor/hardware.
65. Energy Management — energy readings/configuration foundation; live automation requires BMS/EMS integration.
66. Staff Mobile — responsive role-based web UI foundation; native device distribution is deployment work.
67. Guest Mobile / Web App — guest portal, booking, requests, folio/payment foundation.
68. Notifications — notification API/provider-ready layer; live SMS/WhatsApp/push requires provider credentials.
69. Privacy & Security — authentication, RBAC, tenant scoping, audit and secure middleware foundation.
70. Disaster Recovery — backup-run/configuration records; actual geographic redundancy/failover is infrastructure/deployment work.
71. SaaS Super Admin — tenant/property/subscription administration foundation.
72. Subscription Plans — plans/subscription/module entitlement records.

## External / deployment-dependent items

The application does not fake vendor/hardware connectivity. Booking/OTA/GDS connectors, production payment credentials, WhatsApp/SMS/push providers, SSO, smart locks, biometrics, IoT/BMS/EMS, ERP/accounting platforms and geographic disaster recovery require the client's chosen provider credentials, certification and/or infrastructure.

## V9 acceptance gate

Before production handoff, run: `npm install`, `npm run seed`, backend startup, frontend build, and the end-to-end acceptance flows against the target MongoDB and real provider sandbox credentials. Static preflight is included as `npm run verify:static`.
