# Hotel Management System — Final Acceptance Audit V8

## Scope baseline
This build is mapped to the supplied Premium & Enterprise Hotel Management System specification: PMS, Reservations, CRS, Direct Booking Engine, Channel Manager, Revenue, CRM/Loyalty, Housekeeping/Laundry, POS/F&B, Banquet/Events, Spa, Inventory, Purchasing, Finance, HR, Maintenance/Assets, Analytics/BI, Guest Journey, API Hub and SaaS Super Admin.

## V8 corrections made after V7 audit
- Added RBAC guards to reservation list/create/edit/action/check-in/check-out routes.
- Replaced unscoped reservation ID lookups with organization/property-scoped queries.
- Added property/org scoping to room state transitions and folio access.
- Fixed procurement GRN stock bug: inventory now updates `qtyOnHand` rather than a nonexistent `quantity` field.
- Enforced procurement sequence: Draft -> Pending Approval -> RFQ -> Quote Selected -> PO -> GRN -> Supplier Invoice -> Payment Handoff.
- Added RBAC and tenant scoping to procurement, dashboard, audit, AI, notifications, night audit and POS workflows.
- Added POS settlement safeguards and property-scoped room-charge posting.
- Added operational workflow APIs for laundry, minibar, spa, transport, maintenance, lost & found, attendance, forecasting, inventory, cashier, preventive maintenance, events, incidents, shifts and integration-adapter validation.
- Generic enterprise screens now surface workflow buttons for modules where dedicated transition actions are required.
- Added audit events for newly added workflow transitions.

## Verification
Run:

```bash
node scripts/preflight.js
```

Expected V8 static result at packaging time:

```text
183 passed, 0 failed
```

The preflight validates server JavaScript syntax, expected API mounts, enterprise module definitions, client relative imports, the GRN `qtyOnHand` correction, reservation RBAC/scoped lookup invariants, and key workflow route presence.

## Runtime acceptance path
1. Start MongoDB.
2. Configure `server/.env` and `client/.env` from the examples.
3. Run server seed once.
4. Start API and client.
5. Test: login -> booking -> reservation actions -> check-in -> folio/payment -> POS room charge -> checkout -> housekeeping task.
6. Test procurement: PR -> submit -> RFQ -> compare -> PO -> GRN -> supplier invoice -> payment handoff, and verify inventory quantity changes.
7. Test role isolation with front desk, finance, engineering and admin users.
8. Test guest `/book` and `/guest` flows.

## External / infrastructure-dependent capabilities
The application contains models, adapters, state, logs and configuration surfaces for external integrations, but a production vendor transaction cannot be claimed without the relevant provider credentials/contracts/hardware. This applies to OTA/GDS channels, production payment gateway, WhatsApp/SMS/push providers, SSO, smart locks/digital-key vendors, biometrics, IoT/BMS/EMS, external ERP/accounting and geographic disaster-recovery infrastructure.

## Delivery interpretation
V8 is the final local/development implementation package for the supplied functional blueprint. External vendor/hardware features remain integration-ready rather than falsely simulated as production-live.
