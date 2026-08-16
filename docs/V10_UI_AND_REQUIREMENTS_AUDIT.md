# V10 UI + Client Requirements Audit

## UI target
V10 applies the dark navy / champagne-gold premium enterprise design language shown in `docs/UI_REFERENCE.png` to the runnable React application. The update covers the global shell, navigation, header, cards, tables, forms, workflow strips, login and executive dashboard while preserving all V9 routes and workflows.

## Functional scope preserved
No enterprise module was removed. V10 retains the PMS, Reservations, CRS, Direct Booking Engine, Channel Manager, Revenue, CRM/Loyalty, Housekeeping/Laundry, POS/F&B, Banquet/Events, Spa, Inventory, Purchasing, Finance, HR/Staff, Maintenance/Assets, Analytics/BI, Guest Journey, Integration/API Hub and SaaS Super Admin foundations.

## Runtime fix included
Fixed the malformed `setForm({...form,[f]:e.target.value)}` JSX expressions in `client/src/pages/OperationsCenter.jsx` that caused Vite/esbuild to report `Expected "}" but found ")"`.

## Verification
`node scripts/preflight.js` => 198 passed, 0 failed.

The preflight verifies server syntax, mounted API routes, enterprise module definitions, frontend relative imports, reservation RBAC/tenant checks, procurement stock field correctness, and key operational workflow routes.

## External dependencies
Production OTA/GDS, smart-lock, IoT/BMS, messaging, SSO and payment-provider integrations still require client/vendor credentials or hardware. V10 does not fake those external connections.
