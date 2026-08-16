# Requirements Traceability Matrix

This matrix maps the 72 numbered capabilities in the supplied specification to this repository. “Adapter-ready” items depend on third-party/vendor credentials or infrastructure and cannot be made live without those external systems.

| # | Capability | Implementation |
|---:|---|---|
| 1 | Executive Dashboard | Specialized dashboard API/UI with room status, arrivals/departures, revenue and KPI cards. |
| 2 | Reservation Management | Full create/update/cancel/no-show lifecycle with guest, rates, room assignment and source. |
| 3 | Visual Reservation Calendar / Tape Chart | 14-day room tape chart with occupancy/conflict-backed data. |
| 4 | Check-In System | Check-in endpoint, accompanying guests, room transition and folio posting. |
| 5 | Check-Out & Folio Management | Unified folio, payments/refunds/credit notes, invoice number, room Dirty transition, housekeeping task. |
| 6 | Room Management | Full operational statuses and room attributes. |
| 7 | Room Type Management | Room type configuration with occupancy, base rate, amenities and images. |
| 8 | Rate Plans & Pricing Engine | Rate plan + rate-rule modules. |
| 9 | Dynamic Pricing & Revenue Management | Rule engine storage, forecasts and management analytics foundation. |
| 10 | Central Reservation System (CRS) | Central inventory/allotment module and multi-property model. |
| 11 | Direct Booking Engine | Booking engine content/config plus public-ready API layer. |
| 12 | Channel Manager | Channel mapping, synchronization/log records and retry-ready integration hub. |
| 13 | Group Booking Management | Group booking records including blocks, release dates, deposits and master folio flag. |
| 14 | Guest Profiles / CRM | Guest profile with preferences, tags, history-ready stats and consents. |
| 15 | Guest History | Guest-history report endpoint. |
| 16 | Loyalty Program | Loyalty accounts and transactions. |
| 17 | Customer Complaint / Service Request Management | Service requests with SLA, department, assignment and resolution. |
| 18 | Automated Guest Journey | Trigger/channel/template scheduling records. |
| 19 | Upselling Engine | Offer eligibility, pricing, inventory and revenue attribution fields. |
| 20 | AI Concierge | Concierge endpoint with service-request routing. |
| 21 | Housekeeping Management | Live tasks and room state transitions. |
| 22 | Housekeeping Task Management | Checklists, priority, assignment, timestamps and inspection. |
| 23 | Laundry Management | Laundry orders, service type, pickup/delivery, folio-post flags. |
| 24 | Linen Management | Clean/in-room/laundry/damaged/missing/discarded/par-stock tracking. |
| 25 | Minibar Management | Consumption entries with stock and folio posting flags. |
| 26 | Restaurant POS | POS order data with tables, items, taxes, discounts, settlement/room-charge fields. |
| 27 | Room Service | Supported through POS order room/reservation linkage and service-request layer. |
| 28 | Kitchen Display System (KDS) | Kitchen tickets with station routing, priority, timers and status. |
| 29 | Spa & Wellness Management | Appointments, therapist, room, time, price and folio-post flag. |
| 30 | Banquet & Event Management | Event/BEO operational record model. |
| 31 | Conference Room Management | Capacity/layout/equipment/rental records. |
| 32 | Inventory Management | Item, stock, reorder, expiry, batch and costing fields. |
| 33 | Purchase Management | Purchase requests, approvals, PO/GRN/supplier invoice data. |
| 34 | Supplier Management | Supplier commercial, compliance, rating and payment fields. |
| 35 | Accounting & Finance | A/R, A/P and folio financial foundation. |
| 36 | Night Audit | Night audit checklist/result record model. |
| 37 | Cashier Management | Shift cash/card/refund/variance model. |
| 38 | Corporate Account Management | Rates, terms, credit limit, contracts and outstanding. |
| 39 | Travel Agent Management | Rates, commissions, production and payable commissions. |
| 40 | Transportation Management | Pickup/drop, vehicle, driver, cost, status and folio-post flag. |
| 41 | Maintenance Management | Room/asset work orders, technician, SLA target, status and OOO flag. |
| 42 | Preventive Maintenance | Calendar/interval maintenance with next due and checklist. |
| 43 | Asset Management | Lifecycle, serial, cost, warranty, location and history. |
| 44 | Lost & Found | Item, guest/room, storage, photo/status workflow. |
| 45 | Security / Incident Management | Restricted incident record with severity, attachments, actions/outcome. |
| 46 | Employee / HR Management | Employee master. |
| 47 | Shift Management | Roster, timing, overtime and approval. |
| 48 | Attendance | Check-in/out, late/overtime and source integration field. |
| 49 | Role-Based Access Control (RBAC) | Role-aware authentication, property scopes and permission-ready user records. |
| 50 | Approval Workflow | Approval request/decision API and UI. |
| 51 | Audit Trail | Append-only activity log for major actions. |
| 52 | Document Management | Entity-linked documents, tags, expiry/access/retention fields. |
| 53 | Reporting System | Daily operational report + report preset/scheduling records. |
| 54 | Advanced Analytics | Executive KPIs and property-scoped analytics endpoints. |
| 55 | Forecasting | Forecast snapshots with demand, occupancy, revenue, staffing and actual comparison field. |
| 56 | AI Management Assistant | Natural-language occupancy/revenue/cancellation analytics with permission scope. |
| 57 | Multi-Property Management | Organization→Brand→Region→Property→Building→Floor→Room data model. |
| 58 | Central Guest Database | Organization-scoped guest identity model; merge logic is integration-ready rather than automatic. |
| 59 | Multi-Currency | Currency/rate records and base-currency configuration. |
| 60 | Multi-Language | Translation records with locale and brand/property variants. |
| 61 | Tax Configuration | Versioned tax-rule records by department/product/segment. |
| 62 | API & Integration Platform | REST API, integration records, webhook config and monitoring logs. |
| 63 | Smart Door Lock Integration | Credential lifecycle records; live lock vendor activation requires vendor API credentials/certification. |
| 64 | IoT Smart Room Integration | Device/state records; live device control requires vendor gateway/API. |
| 65 | Energy Management | Energy readings and occupancy/exception fields. |
| 66 | Staff Mobile Application | Responsive staff web UI/API foundation; native wrapper can consume the same API. |
| 67 | Guest Mobile Application | Guest-facing API foundation; branded native/web shell is an extension point. |
| 68 | Notification System | Omnichannel notification queue model. |
| 69 | Privacy & Security | Helmet, rate limiting, JWT, tenant/property scoping, audit and secure config defaults. |
| 70 | Disaster Recovery & Business Continuity | Dockerized deployment plus backup-run/verification records; infrastructure failover remains deployment-specific. |
| 71 | SaaS Super Admin | Organization, property, users, subscriptions, plans and feature flags. |
| 72 | Subscription Plans & Commercial Packaging | Standard/Premium/Enterprise plan records seeded and configurable. |
