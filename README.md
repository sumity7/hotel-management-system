# Hotel Management System — Premium Enterprise V8

# Hotel Management System — Premium Enterprise V8

Client-specification aligned hospitality operating platform. See `docs/CLIENT_REQUIREMENTS_AUDIT_V8.md` and `docs/RUN_AND_VERIFY_V8.md`.

# Hotel Management System — Premium Enterprise SaaS

A MERN hotel operating platform aligned to the supplied Premium & Enterprise specification: PMS + CRS + POS + CRM + Revenue + Operations + Finance + Analytics + Multi-Property + SaaS administration.

## Apps
- Staff / management: `http://localhost:5173/login`
- Direct booking engine: `http://localhost:5173/book`
- Guest portal: `http://localhost:5173/guest`
- API health: `http://localhost:5000/api/health`

## Local prerequisites
- Node.js 20+ (Node 22 works)
- npm
- MongoDB Community Server / MongoDB Atlas

## First run — separate terminals (recommended)
### Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

### Frontend
```bash
cd client
npm install
copy .env.example .env
npm run dev
```

`client/.env` should contain:
```env
VITE_API_URL=http://localhost:5000/api
VITE_DEFAULT_PROPERTY_CODE=HTL001
```

## Demo staff login
- SaaS Super Admin: `admin@hms.local` / `Admin@123`
- Front Desk: `frontdesk@hms.local` / `FrontDesk@123`
- GM: `gm@hms.local` / `Manager@123`
- Housekeeping: `housekeeping@hms.local` / `Housekeeping@123`
- Finance: `finance@hms.local` / `Finance@123`
- Revenue: `revenue@hms.local` / `Revenue@123`
- Engineering: `engineering@hms.local` / `Engineering@123`
- Restaurant: `restaurant@hms.local` / `Restaurant@123`
- Kitchen: `kitchen@hms.local` / `Kitchen@123`
- Cashier: `cashier@hms.local` / `Cashier@123`
- System Admin: `system@hms.local` / `System@123`

## Guest demo
After `npm run seed`, the demo guest has phone `9999999999`. The seed command prints its generated reservation confirmation in MongoDB; you can also create a fresh booking at `/book` and use that confirmation + phone at `/guest`.

## Online payment
Local development works without a real gateway by using an explicit mock payment provider.

For Razorpay production order creation and HMAC verification, set in `server/.env`:
```env
RAZORPAY_KEY_ID=rzp_live_or_test_key
RAZORPAY_KEY_SECRET=your_secret
```

Do not commit production secrets.

## Verification
```bash
npm run verify:static
npm run build
```
With backend + MongoDB running:
```bash
npm run smoke:1-20
npm run smoke:modules
```

Static verification in this delivery: **160 passed, 0 failed**.

## Client requirements
See:
- `docs/FINAL_REQUIREMENTS_COVERAGE.md`
- `docs/V6_FINAL_DELIVERY.md`
- `docs/SCREEN_MAP.md`
- `docs/UI_REFERENCE.png`

Third-party commercial networks/hardware require their real vendor credentials/certifications (OTA/GDS, WhatsApp/SMS, SSO, biometrics, smart locks, IoT/BMS/EMS, ERP and geographic failover). The project provides the application-side integration boundaries for these capabilities.

## V11 runtime-fixed release
Use this V11 package instead of V9/V10.

After extracting, create `server/.env` and `client/.env` from the provided examples, then run:

```bash
cd server
npm install
npm run seed
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

If you previously ran V9/V10 in the same browser, clear old local storage once before the first V11 login:

```js
localStorage.clear(); sessionStorage.clear();
```

Then sign in again. V11 automatically selects a property valid for the signed-in user and retries once if an old property context is rejected.

After both services are running, optional live API role smoke test:

```bash
node scripts/runtime-smoke-v11.js
```

## V12 verification

Run static/API contract verification any time:

```bash
npm run verify:static
npm run verify:api-contract
```

After a fresh seed and with the API running:

```bash
npm run smoke:runtime
```
