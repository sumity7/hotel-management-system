# Architecture

## Core tenancy
Organization → Brand → Region → Property → Building → Floor → Room.
Every operational record is organization/property scoped. SaaS Super Admin can operate across tenants; hotel users are tenant scoped.

## Security
JWT authentication, password hashing, Helmet, rate limiting, CORS, property scoping, role checks and audit logs are included. Production deployments should add managed secrets, MFA/SSO provider configuration, WAF, centralized logs and database/network hardening.

## Domain layers
- Core PMS: Rooms, guests, reservations, tape chart, check-in/out, folios, housekeeping.
- Revenue/distribution: Rates, CRS, booking engine config, channel mapping.
- Operations: POS/KDS, laundry/linen/minibar, inventory/purchasing, maintenance/assets, transport.
- Guest/commercial: CRM/loyalty, service requests, journey automation, upselling, spa/events.
- Enterprise: Multi-property, finance, approvals, audit, reporting, APIs, webhooks, subscriptions.
- Intelligence/smart hotel: Forecast records, management assistant, IoT, energy and door-lock adapters.

## Integration policy
OTA/GDS, payment gateway, SSO, digital keys, WhatsApp/SMS, biometric devices, ERP, IoT/BMS and production AI providers require contracts/credentials from those providers. This repository contains the data contracts, integration registry and logging/retry surfaces so live adapters can be plugged in without changing core PMS data models.
