# Client PDF Requirements Audit — V7

This delivery is mapped against the 72 numbered capability areas in the supplied Premium & Enterprise Feature Specification.

Legend: **WORKFLOW** = dedicated executable workflow/API/UI; **MODULE** = operational CRUD/config/reporting surface; **ADAPTER** = internal integration contract exists but live vendor/hardware credentials are required.

| # | Capability | V7 coverage |
|---|---|---|
| 1 | Executive Dashboard | WORKFLOW |
| 2 | Reservation Management | WORKFLOW — create/edit/assign/unassign/move/copy/cancel/reinstate/no-show/split/merge |
| 3 | Visual Reservation Calendar / Tape Chart | WORKFLOW — 14-day chart, drag/drop room move, extend/shorten |
| 4 | Check-In System | WORKFLOW — identity, nationality/visa fields, accompanying guest, deposit, signature, digital key lifecycle |
| 5 | Check-Out & Folio | WORKFLOW — charges/payments/refunds/credit notes/split folio/routing/invoice/dirty-room task |
| 6 | Room Management | WORKFLOW |
| 7 | Room Type Management | MODULE |
| 8 | Rate Plans & Pricing Engine | MODULE + commercial quote API |
| 9 | Dynamic Pricing & Revenue | MODULE + recommendation API |
| 10 | CRS | MODULE + central availability API |
| 11 | Direct Booking Engine | WORKFLOW — live availability, multi-room, promo, add-ons, payment |
| 12 | Channel Manager | MODULE + sync/error records; live OTA requires vendor credentials |
| 13 | Group Booking | MODULE |
| 14 | Guest Profiles / CRM | WORKFLOW/MODULE |
| 15 | Guest History | WORKFLOW/MODULE |
| 16 | Loyalty | MODULE |
| 17 | Complaint / Service Requests | WORKFLOW |
| 18 | Automated Guest Journey | MODULE |
| 19 | Upselling Engine | MODULE + booking add-ons |
| 20 | AI Concierge | WORKFLOW foundation; production LLM/provider optional |
| 21 | Housekeeping | WORKFLOW |
| 22 | Housekeeping Tasks | WORKFLOW |
| 23 | Laundry | MODULE with folio-capable data model |
| 24 | Linen | MODULE |
| 25 | Minibar | MODULE |
| 26 | Restaurant POS | WORKFLOW |
| 27 | Room Service | WORKFLOW through Guest Portal + POS order |
| 28 | KDS | WORKFLOW |
| 29 | Spa & Wellness | MODULE + guest booking workflow |
| 30 | Banquet & Events | MODULE |
| 31 | Conference Rooms | MODULE |
| 32 | Inventory | MODULE |
| 33 | Purchase Management | WORKFLOW — PR → approval → RFQ → compare → PO → GRN → invoice → payment handoff |
| 34 | Supplier Management | MODULE |
| 35 | Accounting & Finance | MODULE/operational ledgers |
| 36 | Night Audit | WORKFLOW |
| 37 | Cashier Management | MODULE |
| 38 | Corporate Accounts | MODULE |
| 39 | Travel Agents | MODULE |
| 40 | Transportation | MODULE + guest service request |
| 41 | Maintenance | MODULE |
| 42 | Preventive Maintenance | MODULE |
| 43 | Assets | MODULE |
| 44 | Lost & Found | MODULE |
| 45 | Security / Incident | MODULE |
| 46 | Employee / HR | MODULE |
| 47 | Shift Management | MODULE |
| 48 | Attendance | MODULE; biometric/RFID/face devices require vendor hardware |
| 49 | RBAC | WORKFLOW/foundation |
| 50 | Approval Workflow | WORKFLOW |
| 51 | Audit Trail | WORKFLOW |
| 52 | Document Management | MODULE |
| 53 | Reporting | WORKFLOW/module |
| 54 | Advanced Analytics | WORKFLOW foundation |
| 55 | Forecasting | MODULE/forecast records + commercial analytics foundation |
| 56 | AI Management Assistant | WORKFLOW foundation; external AI provider optional |
| 57 | Multi-Property | WORKFLOW/foundation — org/brand/region/property hierarchy |
| 58 | Central Guest Database | WORKFLOW/foundation |
| 59 | Multi-Currency | MODULE |
| 60 | Multi-Language | MODULE |
| 61 | Tax Configuration | MODULE |
| 62 | API & Integration Platform | MODULE + REST API + logs/webhooks |
| 63 | Smart Door Lock | ADAPTER + internal digital key lifecycle; physical lock vendor required |
| 64 | IoT Smart Room | ADAPTER/module; hardware/vendor required |
| 65 | Energy Management | MODULE/adapter |
| 66 | Staff Mobile Application | Responsive role-based staff web application foundation |
| 67 | Guest Mobile Application | Responsive Guest Portal workflow — booking/pre-check-in/key/services/folio/payment/checkout request |
| 68 | Notification System | MODULE/API; email/SMS/WhatsApp/push providers require credentials |
| 69 | Privacy & Security | JWT/RBAC/audit/Helmet/CORS/rate-limit foundation; production SSO/MFA policy infrastructure requires deployment config |
| 70 | Disaster Recovery | MODULE/run records; geographic redundancy/failover is deployment infrastructure |
| 71 | SaaS Super Admin | MODULE/admin foundation |
| 72 | Subscription Plans | MODULE |

## Critical V7 improvements over V6

- Dedicated Reservation Control Center for advanced reservation actions.
- Drag/drop Tape Chart room moves plus stay extension/shortening controls.
- Dedicated Check-In Desk with identity/compliance/deposit/e-signature/digital key lifecycle.
- Split-folio, routing and invoice endpoints/UI.
- Direct booking engine supports multi-room and promo-code requests.
- Guest Portal supports pre-arrival check-in, digital-key lookup, checkout request, room service and spa booking.
- Procurement now enforces the required PR → RFQ → comparison → PO → GRN → supplier invoice → payment handoff chain.
- Promo codes and hotel packages added to enterprise data model and seed data.

## Live external dependencies

The application cannot truthfully make Booking.com/Agoda/GDS, production Razorpay, WhatsApp/SMS, SSO, biometric devices, smart locks, IoT/BMS or geographic failover live without the corresponding vendor account, contract, credentials or hardware. V7 keeps these behind adapters/configuration and does not fake a production connection.
