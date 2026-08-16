# V11 Runtime Fix Release

This release is based on V10 and focuses on runtime correctness discovered during live browser testing.

## Fixed
- Role-specific login destinations instead of forcing every role to `/dashboard`.
- Dashboard access for seeded operational roles and stale property-header automatic recovery.
- Auth responses now include effective grants so view-only users do not see unauthorized edit/delete workflow buttons in generic modules.
- Folio payment workflow: settlement vs advance/deposit, positive amount validation, references, refunds, credit notes, split folio, invoice generation.
- Seed folio contains a realistic demo room charge so payment acceptance can be tested immediately after seeding.
- Procurement: approval decision now updates the linked PR, RFQ requires approval, quote comparison requires a real supplier, stage buttons are gated, seeded suppliers use valid IDs.
- POS: kitchen order creation plus Cash/Card/UPI/Room Charge settlement and folio posting.
- React list-key warnings fixed in Approvals, Housekeeping and Reports.
- Sidebar structure rebuilt as fixed header + one scroll region + normal footer so Enterprise Secure does not overlap menu items.
- Query retries no longer spam repeated 4xx errors.

## Verification
- `node scripts/preflight.js` performs server syntax, route, module, import and targeted regression checks.
- `node scripts/runtime-smoke-v11.js` is dependency-free and can be run after server + seed are running to validate every seeded role against the live API.

## External integrations
OTA/GDS, Razorpay production payments, WhatsApp/SMS, SSO, smart locks, biometrics and IoT/BMS still require real provider credentials, contracts or hardware.
