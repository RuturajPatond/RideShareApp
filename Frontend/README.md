# RideLink Mobile (Expo)

RideLink is a BlaBlaCar-inspired mobile app built with Expo Router, Redux Toolkit, and a Node/Express backend.

## Folder Structure

- `app/(auth)` -> public authentication screens (`login`, `signup`)
- `app/(tabs)` -> authenticated app experience (`home`, `booking`, `message`, `profile`)
- `app/_layout.tsx` -> root provider setup and route groups
- `src/components` -> shared UI and platform components
- `src/redux` -> global state, slices, typed store
- `src/services` -> API client and backend communication

## Run Frontend

```bash
npm install
npm start
```

Use Expo CLI options to open Android, iOS, or Web.

## Environment

Create/update `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

If you are testing on Android emulator, `localhost` is auto-tried as `10.0.2.2` by the app.

For a physical iOS device, backend must be reachable on LAN. If auto-discovery fails, set:

```env
EXPO_PUBLIC_API_URL=http://<your-computer-lan-ip>:3001/api/v1
```

Then restart Expo with cache clear (`npx expo start -c`).

## Backend Contract Notes

- Auth: `/auth/signup`, `/auth/login`, `/auth/me`
- Rides: `/rides`, `/rides/:id/book`
- Profile: `/users/profile`
- Vehicles (driver): `/users/vehicles`

## Current Functional Scope

- Token-based auth with secure route guard
- Driver ride publishing
- Rider ride search and booking
- Profile edit and driver vehicle management
- Placeholder in-app messaging UI
