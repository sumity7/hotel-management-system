# Client Configuration

The repository intentionally does not hard-code a client/hotel brand. Configure the hotel identity in `server/.env` before running `npm run seed`.

Key values:

- `SEED_ORGANIZATION_NAME`
- `SEED_BRAND_NAME`
- `SEED_PROPERTY_NAME`
- `SEED_PROPERTY_CODE`
- `SEED_CITY`, `SEED_STATE`, `SEED_COUNTRY`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- `SEED_FRONTDESK_EMAIL`, `SEED_FRONTDESK_PASSWORD`
- `VITE_DEFAULT_PROPERTY_CODE` in `client/.env`

The included `@hms.local` accounts are local demo credentials only. Replace them with the client's real administrative addresses before deployment.
