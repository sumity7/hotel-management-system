# Audited Implementation — Requirements 1–20

This document describes what is concretely implemented for the first twenty numbered capabilities in the client specification. “External adapter required” means the local workflow is implemented but a real vendor account/API is necessary for a live third-party connection.

| # | Requirement | Status | Concrete implementation / test path |
|---:|---|---|---|
| 1 | Executive Dashboard | Working | `/api/dashboard` + Dashboard UI: room state, arrivals/departures, revenue and KPIs. |
| 2 | Reservation Management | Working | Create, availability, assignment, update, cancel, no-show, check-in/check-out with audit. |
| 3 | Tape Chart | Working | `/api/reservations/calendar` + room/date visual calendar. |
| 4 | Check-In | Working | Room allocation prerequisite, accompanying guests, in-house transition, folio room posting. |
| 5 | Check-Out & Folio | Working | Balance validation, invoice number, closed folio, room Dirty, housekeeping task. |
| 6 | Room Management | Working | Room attributes/statuses and room history foundation. |
| 7 | Room Type Management | Working | Occupancy, base rate, amenities, inventory classification. |
| 8 | Rate Plans & Pricing | Working | Rate plan records plus `/api/commercial/rate-quote` nightly pricing breakdown. |
| 9 | Dynamic Pricing / Revenue | Working (rules) | Active date/weekday adjustment rules applied to quote; forecast/advanced competitor feeds remain later enterprise work. |
| 10 | CRS | Working | `/api/commercial/crs/search` searches availability across authorized active properties. |
| 11 | Direct Booking Engine | Working | Public property/availability/booking APIs and `/book` UI connected to live PMS room inventory. |
| 12 | Channel Manager | Local workflow + external adapter required | Mapping records, validation, sync status/error logging, safe dry-run endpoint. Live OTA calls require vendor credentials/certification. |
| 13 | Group Booking | Working | Atomic availability check, room block record, linked reservations, room status and folios. |
| 14 | Guest CRM | Working | Searchable profiles, tags/preferences/consents and dedicated Guest CRM UI. |
| 15 | Guest History | Working | Reservations + folios + service history, recomputed total stays/nights/spend/average rate. |
| 16 | Loyalty Program | Working | Account creation, membership number, earn/redeem validation, tier progression and transactions. |
| 17 | Complaint / Service Request | Working | SLA, department, priority, status/resolution, concierge routing and staff resolution action. |
| 18 | Automated Guest Journey | Working queue | Journey schedule record + omnichannel notification queue. Actual provider delivery requires configured providers. |
| 19 | Upselling Engine | Working | Eligibility query and accepted offer posting to folio with revenue attribution. |
| 20 | AI Concierge | Working local operational assistant | Property-config answers and automatic housekeeping/transport service routing; no claim of external LLM without provider setup. |

## Automated smoke check

With server running and seeded demo credentials:

```bash
npm run smoke:1-20
```

The test checks health, login, dashboard, room types, reservations, tape chart, folios, pricing, CRS, channel dry-run, CRM, service requests, loyalty, journeys, upsells and concierge.
