# Run & Verify V7

## 1. Environment
Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.

## 2. Install
From project root:

```bash
npm run install:all
```

## 3. Seed demo data

```bash
npm run seed
```

Demo admin: `admin@hms.local` / `Admin@123`
Demo front desk: `frontdesk@hms.local` / `FrontDesk@123`
Public booking: `http://localhost:5173/book`
Guest portal: `http://localhost:5173/guest`
Promo code: `WELCOME10`
Demo guest phone after seed: `9999999999`

## 4. Start

```bash
npm run dev
```

API health: `http://localhost:5000/api/health`

## 5. Core acceptance test

1. Login as admin/front desk.
2. Create reservation.
3. Open Reservation Control and edit dates, copy, assign/unassign or split.
4. Open Tape Chart and drag a booking to another room; use + / - to change checkout.
5. Open Check-In Desk, complete ID, signature and deposit, then check in.
6. Open Folios, post charge, receive partial payment, split folio and generate invoice.
7. Open public `/book`, search, choose rooms, enter `WELCOME10`, add extras, create booking and test mock/real payment.
8. Open `/guest`, use confirmation + phone, pre-check-in, request services, view/pay folio and request checkout.
9. Open Procurement Workflow and run PR → RFQ → compare → PO → GRN → invoice → payment handoff.
10. Run Night Audit and review audit trail/reports.

## 6. Static verification

```bash
npm run verify:static
```

A production client build requires npm dependencies to be installed successfully, then:

```bash
npm run build
```
