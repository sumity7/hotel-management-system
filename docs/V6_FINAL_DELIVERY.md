# V6 Final Delivery — Premium & Enterprise Hotel Management System

This release is built directly against the supplied 72-capability client specification.

## Experience layers
1. Public direct booking engine (`/book`) — live PMS availability, room selection, guest data, add-ons, taxes, payment preference and booking confirmation.
2. Guest portal (`/guest`) — booking lookup, stay summary, folio, balance payment and service requests for housekeeping, room service, spa and transport.
3. Staff/management application (`/login`) — role-filtered workspaces for front office, reservations, cashier, housekeeping, F&B, kitchen, revenue, sales/events, finance, engineering, GM, system administration and SaaS Super Admin.
4. Enterprise module layer — configurable operational screens for all remaining modules in the 72-capability specification.

## Payment integration
- Cash, Card, UPI, Bank Transfer, Online and Corporate Billing are represented in the PMS/folio workflows.
- Public/guest online payment API is available at `/api/public/payments/create-order` and `/api/public/payments/capture`.
- With `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`, order creation uses Razorpay and server-side HMAC verification is performed on capture.
- Without credentials, local development uses an explicit mock provider so the end-to-end payment UI can be tested without pretending a real transaction occurred.

## Requirements truthfulness
Internal hotel workflows are implemented in code/data/UI. The following cannot be made genuinely live without external contracts, credentials, hardware or cloud infrastructure: certified OTA/GDS channels, production WhatsApp/SMS, SSO/identity provider, biometric devices, smart-door vendors, IoT/BMS/EMS, ERP/accounting posting, competitor rate-shop feeds and geographic disaster recovery. Adapter/configuration boundaries are present for these areas.

## Validation commands
```bash
npm run verify:static
npm run build
npm run seed
npm run dev
# second terminal
npm run smoke:1-20
npm run smoke:modules
```
